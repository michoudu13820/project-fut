const axios = require('axios');

const urlFutbin = 'https://www.futbin.com/20/playerGraph?type=';
const suiteUrl = "&year=20&player=";

//https://www.futbin.com/20/playerGraph?type=today&year=20&player=67274017&set_id=
function getInformationsJoueur(idJoueur, type) {
    var urlFutbinJoueur = urlFutbin + type + suiteUrl + idJoueur;
    return new Promise((resolve,reject) => setTimeout((urlFutbinJoueur, idJoueur, type) =>   {resolve(axios.get(urlFutbinJoueur)
    .then(res => {
        if (res.status == '200') {
            return res.data.ps;
        }
        else {
            console.log("Erreur lors de la recuperation statut : " +res.status);
        }
    },
        err => {
            console.log('Erreur dans la récupération pour ' + idJoueur + ' avec le type' + type);
            throw "Recuperation impossible";
        }
    )
    .catch(error => {
        console.log('erreur getInformationsJoueur')
        throw "Recuperation impossible";
    }))}, randomDelay(),urlFutbinJoueur,idJoueur,type));
}


function randomDelay() {
    delay = Math.floor(10000 * Math.random())
    console.log('Delai genere de : '+ delay/1000 + 'sec')
    return delay;
}

exports.getInformationsJoueur = getInformationsJoueur;