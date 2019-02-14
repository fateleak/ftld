

const whois = require('whois')


function check_domain(domain, callback) {
    console.log('checking', domain)
    whois.lookup(domain, function (err, data) {
        let ava = true 
        if (data && data.includes('xpiration')) {
            ava = false
        }
        if (domain.endsWith('.com') && data && data.includes('No match for domain')) {
            ava = true
        }
        console.log(ava? 'AA': 'NA', domain, data?data.substring(0, 100):'empty')
        callback(ava, domain, data)
    })
}


exports.check_domain = check_domain