// ---------------------------------------------------------------------
// BookingRepository: puente entre el SERVICE y el DAO de "bookings".
// Mismo patrón que ServiceRepository (ver ese archivo para el porqué de
// la inyección de dependencias con valor por defecto).
// ---------------------------------------------------------------------

import { BookingFsDao } from '../dao/bookings.dao.js';

export class BookingRepository {
  constructor(dao = new BookingFsDao()) {
    this.dao = dao;
  }

  async getAll() {
    return this.dao.getAll();
  }

  async getById(id) {
    return this.dao.getById(id);
  }

  async create(data) {
    return this.dao.createBooking(data);
  }

  async update(id, data) {
    return this.dao.updateBooking(id, data);
  }
}

export const bookingsRepository = new BookingRepository();