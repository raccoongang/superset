const ReportSchema = {
  type: 'object',
  properties: {
    landscape: { type: 'boolean' },
    location: { type: 'string' },
  },
  required: ['landscape', 'location'],
};

module.exports = {
  ReportSchema: ReportSchema,
};
