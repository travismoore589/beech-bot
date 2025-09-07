const responseMessages = require('../response-messages.js');
const queries = require('../database/queries.js');

module.exports = {

        downloadHandler: async (interaction, guildManager) => {
        console.info(`DOWNLOAD command invoked by guild: ${interaction.guildId}`);
        await interaction.deferReply({ ephemeral: true });
        let content = '';
        try {
            const allQuotesFromServer = await queries.fetchAllQuotes(interaction.guildId);
            if (allQuotesFromServer.length === 0) {
                await interaction.followUp('There haven\'t been any quotes saved from this server, so I didn\'t attach a file.');
                return;
            }
            for (const quote of allQuotesFromServer) {
                content += await utilities.formatQuote(
                    quote,
                    true,
                    true,
                    guildManager,
                    interaction
                ) + '\n';
            }
            const buffer = Buffer.from(content);
            await interaction.followUp({
                files: [new AttachmentBuilder(buffer, { name: 'quotes.txt' })],
                content: 'Here you go <:kermitGape:1406651455351558315> all the quotes saved from this server!',
                ephemeral: false
            });
        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: responseMessages.GENERIC_INTERACTION_ERROR, ephemeral: true });
        }
    },
    
    addHandler: async (interaction) => {
        const author = interaction.options.getString('author').trim();
        const quote = interaction.options.getString('quote').trim();
        const result = await queries.addQuote(quote, author, interaction.guildId).catch(async (e) => {
            if (e.includes('duplicate key')) {
                await interaction.reply(responseMessages.DUPLICATE_QUOTE);
            } else {
                await interaction.reply(responseMessages.GENERIC_ERROR);
            }
        });

        if (!interaction.replied) {
            await interaction.reply('Added the following:\n\n' + formatQuote(result[0], false, false));
        }
    },

    countHandler: async (interaction) => {
        const author = interaction.options.getString('author')?.trim();
        try {
            const queryResult = author
                ? await queries.fetchQuoteCountByAuthor(author, interaction.guildId)
                : await queries.fetchQuoteCount(interaction.guildId);
            if (queryResult.length > 0) {
                if (author) {
                    await interaction.reply('**' + author + '** has said **' + queryResult[0].count + '** quotes.');
                } else {
                    await interaction.reply('There are **' + queryResult[0].count + '** quotes.');
                }
            } else {
                await interaction.reply(responseMessages.QUOTE_COUNT_0);
            }
        } catch (e) {
            await interaction.reply(responseMessages.GENERIC_ERROR_COUNT_COMMAND);
        }
    },

    randomHandler: async (interaction) => {
        const author = interaction.options.getString('author')?.trim();
        try {
            const queryResult = author
                ? await queries.getQuotesFromAuthor(author, interaction.guildId)
                : await queries.fetchAllQuotes(interaction.guildId);
            if (queryResult.length > 0) {
                const randomQuote = queryResult[Math.floor(Math.random() * queryResult.length)];
                await interaction.reply(formatQuote(randomQuote, true, false));
            } else {
                await interaction.reply(responseMessages.NO_QUOTES_BY_AUTHOR);
            }
        } catch (e) {
            await interaction.reply(responseMessages.RANDOM_QUOTE_GENERIC_ERROR);
        }
    },

    searchHandler: async (interaction) => {
        const searchString = interaction.options.getString('search_string')?.trim();
        const includeIdentifier = interaction.options.getBoolean('include_identifier');
        const searchResults = await queries.fetchQuotesBySearchString(searchString, interaction.guildId).catch(async (e) => {
            await interaction.reply(responseMessages.GENERIC_ERROR);
        });

        let reply = '';
        if (searchResults.length === 0) {
            reply += responseMessages.EMPTY_QUERY;
        } else if (searchResults.length > 10) {
            reply += responseMessages.QUERY_TOO_GENERAL;
        } else {
            reply += 'Your search for "' + searchString + '" returned **' + searchResults.length + '** quotes: \n\n';
            for (const result of searchResults) {
                const quote = formatQuote(result, true, includeIdentifier);
                reply += quote + '\n';
            }
        }

        if (!interaction.replied) {
            await interaction.reply(reply);
        }
    },

    deleteHandler: async (interaction) => {
        await interaction.deferReply();
        console.info(`DELETE command invoked by guild: ${interaction.guildId}`);
        let searchResults;
        try {
            searchResults = await utilities.getQuoteSearchResults(interaction);
        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: responseMessages.GENERIC_INTERACTION_ERROR });
            return;
        }
        if (searchResults.length === 0) {
            await interaction.followUp(responseMessages.EMPTY_QUERY);
            return;
        } else if (searchResults.length > constants.MAX_DELETE_SEARCH_RESULTS) {
            await interaction.followUp(responseMessages.DELETE_QUERY_TOO_GENERAL);
            return;
        }
        const replyComponents = await utilities.buildDeleteInteraction(searchResults);
        if (replyComponents.replyText.length > constants.MAX_DISCORD_MESSAGE_LENGTH) {
            await interaction.followUp({ content: responseMessages.DELETE_SEARCH_RESULT_TOO_LONG });
            return;
        }
        const response = await interaction.followUp({
            content: replyComponents.replyText,
            components: [new ActionRowBuilder().addComponents(replyComponents.buttons)]
        });
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const choice = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            queries.deleteQuoteById(choice.customId, interaction.guildId)
                .then(async (result) => {
                    if (result.length === 0) {
                        await choice.update({ content: responseMessages.NOTHING_DELETED, components: [] });
                    } else {
                        await choice.update({
                            content: 'The following quote was deleted: \n\n' +
                                await utilities.formatQuote(result[0], true),
                            components: []
                        });
                    }
                })
                .catch(async (e) => {
                    console.error(e);
                    await choice.update({ content: responseMessages.GENERIC_INTERACTION_ERROR, ephemeral: false, components: [] });
                });
        } catch (e) {
            await interaction.editReply({ content: 'A quote was not chosen within 60 seconds, so I cancelled the interaction.', components: [] });
        }
    },

function formatQuote (quote, includeDate = true, includeIdentifier = false) {
    let quoteMessage = '';
    const d = new Date(quote.said_at);
    const year = d.getFullYear().toString().slice(2);

    quoteMessage += '_"' + quote.quotation + '"_ - ' + quote.author

    if (includeDate) {
        quoteMessage += ' (' + (d.getMonth() + 1) + '/' + (d.getDate()) + '/' + year + ')';
    }

    if (includeIdentifier) {
        quoteMessage += ' (**identifier**: _' + quote.id + '_)';
    }

    return quoteMessage;
}
