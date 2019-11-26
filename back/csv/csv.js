var apiFutbin = require('../apiCaller/apiCaller');
/**
 * Fichier permettant l'export csv, contient le corp et le remplisage des colonnes
 */
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//Définition des noms des colonnes
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'name', title: 'NOM' },
        { id: 'type', title: 'TYPE' },
        { id: 'volatilite', title: 'VOLATILITE' },
        { id: 'priceToBuy', title: 'PRIX ACHAT' },
        { id: 'priceToSell', title: 'PRIX VENTE' },
        { id: 'benef', title: 'BENEF' },
        { id: 'meanPriceToday', title: 'PRIX MOYEN AUJ' },
        { id: 'meanPriceYest', title: 'PRIX MOYEN HIER' },
        { id: 'meanPriceBefYest', title: 'PRIX MOYEN AV-HIER' }
    ]
});

//decale de 3 afin de pouvoir recuperer facilement la date à j-3
const tableauJourMoins3 = ['friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];


const listeJoueurs = [
     { id: 67274017, nom: 'BenzemaIF', type: 'IF' },
     { id: 50532597, nom: 'Lucas', type: 'UCL' },
     { id: 50533774, nom: 'Kane', type: 'UCL' },
     { id: 50467155, nom: 'Fernandinho', type: 'UCL' },
     { id: 50522131, nom: 'Douglas Costa', type: 'UCL' },
     { id: 50543836, nom: 'Werner', type: 'UCL' },
     { id: 50537248, nom: 'Umtiti', type: 'UCL' },
     { id: 50544270, nom: 'Kimmich', type: 'UCL' },
     { id: 67337566, nom: 'De Jong', type: 'UCL' },
     { id: 50562314, nom: 'Gabriel Jesus', type: 'UCL' },
    { id: 50559576, nom: 'Semeido', type: 'UCL' },
    { id: 67298106, nom: 'Coutinho', type: 'UCL' },
    { id: 50508324, nom: 'Marcelo', type: 'UCL' },
    { id: 50543866, nom: 'Laporte', type: 'UCL' },
    { id: 50532672, nom: 'Koulibaly', type: 'UCL' }

]


/**
 * Fonction permettant de generer le csv
 */
function generateCSV() {
    console.log("begin generateCSV");
    var data = [];
    //Creation du tableau qui va stocker toutes les promises de recuperation et calcule de prix
    var request = [];
    listeJoueurs.forEach(value => {
        request.push(genererLigne(value.id, value.nom, value.type).then(
            res => {
                data.push(res);
                return res;
            },
            err => console.error(err)
        ).catch(err => console.log(err)))
    }

    );
    //Une fois que tout s'est termine on lance la generation du csv
    Promise.all(request).then(() => csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'))).catch(err => console.log(err));
}

/**
 * Fonction permettant de definir la ligne du fichier csv pour un joueur
 * @param {} idJoueur 
 * @param {*} nomJoueur 
 */
function genererLigne(idJoueur, nomJoueur, typeJoueur) {
    //Tableau des dates pour la recuperation des infos;
    var dates = ['today', 'yesterday', 'da_yesterday'];
    //Tableau stockant les trois appels à l'api pour le calcule de la moyenne sur 3 jours
    var tabInfos = [];
    var infos = {
        name: nomJoueur,
        type: typeJoueur
    };
    var appelsApiFutbin = [];
    dates.forEach(date => {
        appelsApiFutbin.push(apiFutbin.getInformationsJoueur(idJoueur, date)
            .then(res => {
                res.forEach(prix => tabInfos.push(prix));
                jsonConcat(infos, calculerInfosJoueur(res, date));
            })
            .catch(err => console.log(err)))
    })


    return new Promise(function (resolve, reject) {
        resolve(
            Promise.all(appelsApiFutbin).then(() => {
                return jsonConcat(infos, calculerInfosJoueur(tabInfos, 'all'))
            }).catch(error => console.log(error))
        )
    });

}

/**
 * Fonction permettant de calculer les infos du joeurs, 
 * sa volatilite, sa moyenne, son prix d'achat, son prix de vente ainsi que le benefice esperé
 */
function calculerInfosJoueur(prix, typeCalcule) {
    //Ajout de tous les prix dans un seul tableau
    var listePrix = [];
    prix.forEach(prix => listePrix.push(prix[1]));
    //On le lance pas le calcule si la taille des prix est vide
    if (listePrix.length > 0) {
         //Prix moyen tronqué à l'unite
        const prixMoyen = Math.trunc(listePrix.reduce((acc, val) => { return acc + val; }, 0) / listePrix.length);
        if (typeCalcule === 'today') {
            return {
                meanPriceToday: prixMoyen
            }

        }
        if (typeCalcule === 'yesterday') {
            return {
                meanPriceYest: prixMoyen
            }

        }
        if (typeCalcule === 'all') {
            //Calcule de la volatilite
            //Prix max du joueur, utilise comme ça car la fonction Math.max remonte NaN
            const prixMax = listePrix.reduce((prev, current) => (prev > current) ? prev : current);
            //Prix min du joueur, utilise comme ça car la fonction Math.max remonte NaN
            const prixMin = listePrix.reduce((prev, current) => (prev < current) ? prev : current);
            var volatilite = ((prixMax - prixMin) / prixMoyen).toFixed(2) + '%';
            var prixAchat = Math.round(prixMoyen * 0.9);
            var prixVente = Math.round(prixMoyen * 1.09);
            var benef = Math.round(prixVente * 0.95 - prixAchat);
            return {
                volatilite: volatilite,
                priceToBuy: prixAchat,
                priceToSell: prixVente,
                benef: benef
            }

        }
        else {
            return {
                meanPriceBefYest: prixMoyen
            }
        }
    }
}


function calculerMoyenne() {

}


/**
 * Methode permettant de concatener deux objets json
 * @param {} o1 
 * @param {*} o2 
 */
function jsonConcat(o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}

exports.generateCSV = generateCSV;
