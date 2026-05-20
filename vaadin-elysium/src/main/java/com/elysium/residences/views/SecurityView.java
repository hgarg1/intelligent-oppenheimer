package com.elysium.residences.views;

import com.vaadin.flow.component.AttachEvent;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.router.Route;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Route("security")
public class SecurityView extends Div {

    private static final Logger logger = LoggerFactory.getLogger(SecurityView.class);

    public SecurityView() {
        addClassName("security-viewport");
        loadTemplate();
    }

    private void loadTemplate() {
        try (InputStream inputStream = getClass().getResourceAsStream("/META-INF/resources/security/index.html")) {
            if (inputStream == null) {
                logger.error("Could not find security index.html in resources!");
                getElement().setProperty("innerHTML", "<div style='color:red; padding:50px;'>Error: Security page template not found.</div>");
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
                getElement().setProperty("innerHTML", bodyHtml);
                logger.info("Successfully injected luxury security landing DOM.");
            } else {
                getElement().setProperty("innerHTML", htmlContent);
                logger.warn("Injected raw security index.html (missing body tags).");
            }
        } catch (Exception e) {
            logger.error("Failed to load security page template", e);
            getElement().setProperty("innerHTML", "<div style='color:red; padding:50px;'>Error loading page: " + e.getMessage() + "</div>");
        }
    }

    @Override
    protected void onAttach(AttachEvent attachEvent) {
        super.onAttach(attachEvent);
        // Execute dynamic initialization for the custom cursor hover and page interactions
        attachEvent.getUI().getPage().executeJs(
            "const cursor = document.getElementById('custom-cursor');" +
            "if (cursor) {" +
            "  const hoverables = document.querySelectorAll('a, button, input');" +
            "  hoverables.forEach(item => {" +
            "    item.addEventListener('mouseenter', () => cursor.classList.add('hovered'));" +
            "    item.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));" +
            "  });" +
            "}" +
            "const container = document.querySelector('.security-viewport');" +
            "if (container) {" +
            "  const scripts = container.querySelectorAll('script');" +
            "  scripts.forEach(script => {" +
            "    const code = script.textContent;" +
            "    const originalAddEventListener = document.addEventListener;" +
            "    document.addEventListener = function(event, callback, options) {" +
            "      if (event === 'DOMContentLoaded') {" +
            "        callback();" +
            "      } else {" +
            "        originalAddEventListener.call(document, event, callback, options);" +
            "      }" +
            "    };" +
            "    try {" +
            "      const runFn = new Function(code);" +
            "      runFn();" +
            "    } catch (err) {" +
            "      console.error('Failed to execute view script:', err);" +
            "    } finally {" +
            "      document.addEventListener = originalAddEventListener;" +
            "    }" +
            "  });" +
            "}"
        );
    }
}
