const ent = require('ent')
const moment = require('moment')

// Get first page of private messages.
export const getFirstPage = ({ request }) =>
  async params => {
    const response = await request({
      uri: 'messages-prives/boite-reception_ws.php',
      qs: { page: 1 }, // Optional for first page.
    })

    // data.message_recus.nb_message: int (total)
    // data.message_recus.page[0]: int
    // data.message_recus.nonlu[0]: int

    return response.body.message_recus.message
      .map(m => ({
        id: m.id[0],
        subject: ent.decode(m.sujet[0]),
        author: m.auteur[0],
        date: moment(m.date[0], 'DD/MM/YYYY - HH:mm:ss').toDate(),
        isRead: m.etat[0] === 'lu',
      }))
  }
