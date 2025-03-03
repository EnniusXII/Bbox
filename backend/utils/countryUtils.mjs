import stringSimilarity from 'string-similarity';

export const countryCodeMap = {
	'austria': 'A',
	'albania': 'AL',
	'armenia': 'AM',
	'azerbaijan': 'AZ',
	'andorra': 'AND',
	'belgium': 'B',
	'bulgaria': 'BG',
	'bosnia and herzegovina': 'BIH',
	'belarus': 'BY',
	'schweiz': 'CH',
	'cyprus': 'CY',
	'czech republic': 'CZ',
	'germany': 'D',
	'denmark': 'DK',
	'spain': 'E',
	'estonia': 'EST',
	'france': 'F',
	'finland': 'FIN',
	'liechtenstein': 'FL',
	'faroe islands': 'FO',
	'united kingdom': 'GB',
	'georgia': 'GEO',
	'greece': 'GR',
	'hungary': 'H',
	'croatia': 'HR',
	'italy': 'I',
	'ireland': 'IRL',
	'iceland': 'IS',
	'Luxembourg': 'L',
	'lithuania': 'LT',
	'latvia': 'LV',
	'malta': 'M',
	'monaco': 'MC',
	'moldova': 'MD',
	'montenegro': 'MNE',
	'norway': 'N',
	'netherlands': 'NL',
	'north macedonia': 'NMK',
	'portugal': 'P',
	'poland': 'PL',
	'kosovo': 'RKS',
	'romania': 'RO',
	'san marino': 'RSM',
	'russia': 'RUS',
	'sweden': 'S',
	'slovenia': 'SLO',
	'slovakia': 'SK',
	'serbia': 'SRB',
	'turkey': 'TR',
	'ukraine': 'UA',
	'united kingdom': 'UK',
	'vatican city': 'V',
};

export const getCountryCode = (input) => {
	if (!input) return null;

	const normalizedInput = input.toLowerCase().trim();

	if (countryCodeMap[normalizedInput]) return countryCodeMap[normalizedInput];

	const countryNames = Object.keys(countryCodeMap);
	const bestMatch = stringSimilarity.findBestMatch(
		normalizedInput,
		countryNames
	);

	if (bestMatch.bestMatch.rating >= 0.6) {
		return countryCodeMap[bestMatch.bestMatch.target];
	}

	return null;
};
