const ent = require('ent')
const moment = require('moment')
const cheerio = require('cheerio')
const { err } = require('./util')

// List private messages (paginated).
export const list = ({ request }) =>
  async ({ page = 1 } = {}) => {
    const response = await request({
      uri: 'messages-prives/boite-reception_ws.php',
      qs: { page },
    })

    const m = response.body.message_recus

    return {
      count: Number(m.nb_message[0]), // Total number of threads.
      page: Number(m.page[0]), // Current page.
      unread: Number(m.nonlu[0]),

      threads: m.message
        .map(m => ({
          id: m.id[0],
          subject: ent.decode(m.sujet[0]),
          author: m.auteur[0],
          date: moment(m.date[0], 'DD/MM/YYYY - HH:mm:ss').toDate(),
          isRead: m.etat[0] === 'lu',
        })),
    }
  }

// Get thread messages (offset pagination).
export const thread = ({ request, parsePosts }) =>
  async ({ id, offset = 0 }) => {
    const response = await request({
      uri: 'messages-prives/message_ws.php',
      qs: { id_discussion: id, last_position_message: offset },
    })

    const d = response.body.discussion

    if (d.erreur) {
      throw err(d.erreur[0].texte_erreur[0])
    }

    return {
      id,
      subject: d.titre[0],
      members: d.participant.map(p => p.pseudo),
      count: Number(d.nb_message[0]), //Total number of messages.
      next: Number(d.last_position_message[0]), // Give this as `offset` for next page.
      messages: parsePosts(d.contenu_discussion[0]).reverse(), // Last posts first.
    }
  }
