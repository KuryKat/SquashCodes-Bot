module.exports = {
	event: 'warn',
	execute(_client, log, [e]) {
		log.warn(e);
		//'```' + e + '```')
	}
};