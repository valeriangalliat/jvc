const ent = require('ent')
const moment = require('moment')

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
