package com.elysium.residences.services;

import com.elysium.residences.data.BookingRequest;
import com.elysium.residences.data.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<BookingRequest> findAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional
    public BookingRequest saveBooking(BookingRequest booking) {
        logger.info("Saving new VIP booking request for {}", booking.getName());
        return bookingRepository.save(booking);
    }

    @Transactional
    public void deleteBooking(BookingRequest booking) {
        logger.info("Deleting booking request for {}", booking.getName());
        bookingRepository.delete(booking);
    }
}
