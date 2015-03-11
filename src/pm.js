const ent = require('ent')
const moment = require('moment')
const { xml } = require('./util')

// Get first page of private messages.
export const getFirstPage = ({ requestCookie, page }) =>
  async params => {
    const response = await requestCookie({
      url: page('messages-prives/boite-reception_ws.php'),
      qs: { page: 1 }, // Optional for first page.
    })

    const data = await xml(response.body)

    // data.message_recus.nb_message: int (total)
    // data.message_recus.page[0]: int
    // data.message_recus.nonlu[0]: int

    return data.message_recus.message
      .map(m => ({
        id: m.id[0],
        subject: ent.decode(m.sujet[0]),
        author: m.auteur[0],
        date: moment(m.date[0], 'DD/MM/YYYY - HH:mm:ss').toDate(),
        isRead: m.etat[0] === 'lu',
      }))
  }
