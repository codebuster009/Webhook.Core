const { prisma } = require('../lib/prisma');

function create(data) {
  return prisma.partner.create({ data });
}

function findById(id) {
  return prisma.partner.findUnique({ where: { id } });
}

function list(options = {}) {
  const { status, skip = 0, take = 100 } = options;
  const where = status ? { status } : undefined;
  return prisma.partner.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take });
}

function update(id, data) {
  return prisma.partner.update({ where: { id }, data });
}

module.exports = {
  create,
  findById,
  list,
  update,
};
