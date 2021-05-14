module.exports = {
	event: 'rateLimit',
	execute(_client, log, [limit]) {
		log.warn('Rate-limited! (Ative o modo de debug na config para mais detalhes)');
		log.debug(limit);
		//'Rate-limited! (Ative o modo de debug na config para mais detalhes)')
		//limit)

	}
};