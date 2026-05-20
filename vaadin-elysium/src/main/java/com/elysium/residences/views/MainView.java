package com.elysium.residences.views;

import com.elysium.residences.data.BookingRequest;
import com.elysium.residences.services.BookingService;
import com.vaadin.flow.component.AttachEvent;
import com.vaadin.flow.component.ClientCallable;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.router.Route;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Collectors;

@Route("")
public class MainView extends Div {

    private static final Logger logger = LoggerFactory.getLogger(MainView.class);

    private final BookingService bookingService;
    private final Validator validator;

    @Autowired
    public MainView(BookingService bookingService, Validator validator) {
        this.bookingService = bookingService;
        this.validator = validator;

        // Set class name matching any main theme wrapper if needed
        addClassName("main-viewport");

        // Load the HTML landing template from classpath resources
        loadLandingTemplate();
    }

    private void loadLandingTemplate() {
        try (InputStream inputStream = getClass().getResourceAsStream("/index.html")) {
            if (inputStream == null) {
                logger.error("Could not find index.html in resources!");
                getElement().setProperty("innerHTML", "<div style='color:red; padding:50px;'>Error: Landing page template not found.</div>");
                return;
            }

            String htmlContent = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))
                    .lines()
                    .collect(Collectors.joining("\n"));

            // Extract content within <body>...</body> to render directly inside Vaadin's layout root
            int bodyStart = htmlContent.indexOf("<body");
            int bodyEnd = htmlContent.indexOf("</body>");

            if (bodyStart != -1 && bodyEnd != -1) {
                int tagClose = htmlContent.indexOf(">", bodyStart);
                String bodyHtml = htmlContent.substring(tagClose + 1, bodyEnd);
                
                // Inject the landing page DOM
                getElement().setProperty("innerHTML", bodyHtml);
                logger.info("Successfully injected luxury index.html landing DOM.");
            } else {
                getElement().setProperty("innerHTML", htmlContent);
                logger.warn("Injected raw index.html (missing body tags).");
            }
        } catch (Exception e) {
            logger.error("Failed to load landing page template", e);
            getElement().setProperty("innerHTML", "<div style='color:red; padding:50px;'>Error loading page: " + e.getMessage() + "</div>");
        }
    }

    @Override
    protected void onAttach(AttachEvent attachEvent) {
        super.onAttach(attachEvent);
        // Expose this Java component to the client-side window object to allow JavaScript callbacks
        attachEvent.getUI().getPage().executeJs("window.VaadinView = $0;", getElement());
    }

    /**
     * Client-callable callback to process and secure the luxury tour reservation.
     */
    @ClientCallable
    public String submitBooking(String name, String email, String phone, String suiteType, String bookingDate, String timeSlot, String specialRequests) {
        logger.info("Received client-side booking request submission: {}", name);

        BookingRequest booking = new BookingRequest();
        booking.setName(name);
        booking.setEmail(email);
        booking.setPhone(phone);
        booking.setSuiteType(suiteType);
        booking.setBookingDate(bookingDate);
        booking.setTimeSlot(timeSlot);
        booking.setSpecialRequests(specialRequests);

        // Perform server-side validation using Hibernate Validator annotations
        Set<ConstraintViolation<BookingRequest>> violations = validator.validate(booking);
        if (!violations.isEmpty()) {
            String errorMsg = violations.iterator().next().getMessage();
            logger.warn("Validation failed for booking request: {}", errorMsg);
            return "ERROR: " + errorMsg;
        }

        try {
            // Persist the reservation securely in SQLite database
            bookingService.saveBooking(booking);
            logger.info("Successfully secured VIP booking request in SQLite for: {}", name);
            return "SUCCESS";
        } catch (Exception e) {
            logger.error("Database persistence failed for booking request", e);
            return "ERROR: System reservation failed. Please contact concierge.";
        }
    }
}
