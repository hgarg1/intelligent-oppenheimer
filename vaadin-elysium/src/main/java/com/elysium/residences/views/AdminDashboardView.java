package com.elysium.residences.views;

import com.elysium.residences.data.BookingRequest;
import com.elysium.residences.services.BookingService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.Icon;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Route("admin")
@PageTitle("Elysium Registry - Admin Dashboard")
public class AdminDashboardView extends VerticalLayout {

    private final BookingService bookingService;
    private final Grid<BookingRequest> grid;
    private final Span bookingCounter;

    @Autowired
    public AdminDashboardView(BookingService bookingService) {
        this.bookingService = bookingService;
        
        // Root container styling matching the luxury dark aesthetic
        addClassName("admin-dashboard-root");
        setSizeFull();
        setPadding(true);
        setSpacing(true);

        // Header Section
        HorizontalLayout header = new HorizontalLayout();
        header.setWidthFull();
        header.setAlignItems(Alignment.CENTER);
        header.addClassName("admin-header");

        Div brandLogo = new Div();
        brandLogo.addClassName("admin-brand-logo");
        brandLogo.setText("✦");

        H1 title = new H1("ELYSIUM RESIDENCES REGISTRY");
        title.addClassName("admin-title");

        bookingCounter = new Span();
        bookingCounter.addClassName("admin-counter-badge");

        header.add(brandLogo, title, bookingCounter);

        // Grid Component Definition
        grid = new Grid<>(BookingRequest.class, false);
        grid.addClassName("admin-grid");
        grid.setSizeFull();

        grid.addColumn(BookingRequest::getId)
                .setHeader("REGISTRY ID")
                .setWidth("100px")
                .setFlexGrow(0);
        grid.addColumn(BookingRequest::getName)
                .setHeader("VIP CLIENT NAME")
                .setSortable(true);
        grid.addColumn(BookingRequest::getEmail)
                .setHeader("EMAIL ADDRESS")
                .setSortable(true);
        grid.addColumn(BookingRequest::getPhone)
                .setHeader("PHONE");
        grid.addColumn(booking -> formatSuiteType(booking.getSuiteType()))
                .setHeader("SELECTED SUITE")
                .setSortable(true);
        grid.addColumn(BookingRequest::getBookingDate)
                .setHeader("SHOWING DATE")
                .setSortable(true);
        grid.addColumn(booking -> formatTimeSlot(booking.getTimeSlot()))
                .setHeader("TIME SLOT")
                .setSortable(true);
        grid.addColumn(BookingRequest::getSpecialRequests)
                .setHeader("SPECIAL REQUESTS & VALET REQUIREMENTS");

        // Action Column (Delete)
        grid.addComponentColumn(booking -> {
            Button deleteBtn = new Button(new Icon(VaadinIcon.TRASH));
            deleteBtn.addClassName("btn-delete-booking");
            deleteBtn.addClickListener(e -> confirmAndDelete(booking));
            return deleteBtn;
        }).setHeader("ACTIONS").setWidth("100px").setFlexGrow(0);

        // Controls bar
        HorizontalLayout controls = new HorizontalLayout();
        controls.setWidthFull();
        controls.addClassName("admin-controls");

        Button refreshBtn = new Button("Refresh Registry", new Icon(VaadinIcon.REFRESH));
        refreshBtn.addClassName("btn-admin-refresh");
        refreshBtn.addClickListener(e -> refreshData());

        Button backToSiteBtn = new Button("Main Portal", new Icon(VaadinIcon.ARROW_LEFT));
        backToSiteBtn.addClassName("btn-admin-back");
        backToSiteBtn.addClickListener(e -> getUI().ifPresent(ui -> ui.navigate("")));

        controls.add(backToSiteBtn, refreshBtn);

        // Assemble Layout
        add(header, controls, grid);

        // Load initial database list
        refreshData();
    }

    private void refreshData() {
        List<BookingRequest> bookings = bookingService.findAllBookings();
        grid.setItems(bookings);
        bookingCounter.setText(bookings.size() + " VIP RESERVATIONS");
    }

    private void confirmAndDelete(BookingRequest booking) {
        try {
            bookingService.deleteBooking(booking);
            Notification notification = Notification.show("Reservation for " + booking.getName() + " removed successfully.", 4000, Notification.Position.BOTTOM_CENTER);
            notification.addThemeVariants(NotificationVariant.LUMO_SUCCESS);
            refreshData();
        } catch (Exception e) {
            Notification notification = Notification.show("Error deleting reservation: " + e.getMessage(), 4000, Notification.Position.BOTTOM_CENTER);
            notification.addThemeVariants(NotificationVariant.LUMO_ERROR);
        }
    }

    private String formatSuiteType(String key) {
        if (key == null) return "N/A";
        switch (key.toLowerCase()) {
            case "penthouse":
                return "The Grand Penthouse";
            case "skyvilla":
                return "Aether Sky Villa";
            case "signature":
                return "Signature Suite";
            default:
                return key.substring(0, 1).toUpperCase() + key.substring(1);
        }
    }

    private String formatTimeSlot(String key) {
        if (key == null) return "N/A";
        switch (key.toLowerCase()) {
            case "morning":
                return "Morning (09:00 AM - 12:00 PM)";
            case "afternoon":
                return "Afternoon (01:00 PM - 04:00 PM)";
            case "evening":
                return "Evening (05:00 PM - 08:00 PM)";
            default:
                return key.substring(0, 1).toUpperCase() + key.substring(1);
        }
    }
}
