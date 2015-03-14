const $ = require('cheerio')
const moment = require('moment')

// Map French months to numbers.
const months = {
  'janvier': '01',
  'février': '02',
  'mars': '03',
  'avril': '04',
  'mai': '05',
  'juin': '06',
  'juillet': '07',
  'août': '08',
  'septembre': '09',
  'octobre': '10',
  'novembre': '11',
  'décembre': '12',
}

const monthsRegex = new RegExp(Object.keys(months).join('|'))

const parseDate = date =>
  moment(
    date.replace(monthsRegex, month => months[month]),
    'DD MM YYYY à HH:mm:ss'
  ).toDate()

const parsePost = $post => {
  // Show alternative text for images.
  $post.find('[alt]').each(function () {
    $(this).replaceWith(this.attribs['alt'])
  })

  return $post.text()
    // Looks like the API convert quotes, need to parse back.
    .replace(/’|’/g, '\'')
}

export const parse = $item =>
  ({
    image: $item.find('.avatar img').attr('src'),
    author: $item.find('.pseudo a')[0].firstChild.data.trim(),
    date: parseDate($item.find('.date').text()),
    post: parsePost($item.find('.post')),
  })

export const parsePosts = html =>
  Array.from($.load(html)('#list_msg > ul'))
    .map($)
    .map(parse)
