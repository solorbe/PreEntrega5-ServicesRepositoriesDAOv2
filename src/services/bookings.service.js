import { bookingsRepository } from '../repositories/bookings.repository.js';
import { servicesService } from '../services/services.service.js';

class BookingsService {
  constructor() {
    this.bookingRepository = bookingsRepository;
    this.servicesService = servicesService;
  }

  async getBookingById(id) {
    return this.bookingRepository.getById(id);
  }

  async createBooking(data) {
    return this.bookingRepository.create(data);
  }

  async addServiceToBooking(bid, sid) {
    const servicio = await this.servicesService.getServiceById(sid);

    if (!servicio) {
      return { error: 'SERVICE_NOT_FOUND' };
    }

    const booking = await this.bookingRepository.getById(bid);

    if (!booking) {
      return { error: 'BOOKING_NOT_FOUND' };
    }

    const item = booking.services.find(
      (s) => s.service === Number(sid)
    );

    if (item) {
      item.quantity += 1;
    } else {
      booking.services.push({
        service: Number(sid),
        quantity: 1
      });
    }

    const bookingActualizada =
      await this.bookingRepository.update(bid, {
        services: booking.services
      });

    return { booking: bookingActualizada };
  }
}

export const bookingsService = new BookingsService();