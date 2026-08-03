package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    /**
     * Current page content.
     */
    private List<T> content;

    /**
     * Current page number (0-based).
     */
    private int page;

    /**
     * Size of each page.
     */
    private int size;

    /**
     * Total number of elements.
     */
    private long totalElements;

    /**
     * Total available pages.
     */
    private int totalPages;

    /**
     * Is this the first page?
     */
    private boolean first;

    /**
     * Is this the last page?
     */
    private boolean last;

    /**
     * Number of elements in current page.
     */
    private int numberOfElements;
    private String sortBy;

    private String sortDirection;

    /**
     * Convert Spring Page<T> into PagedResponse<T>
     */
    public static <T> PagedResponse<T> from(Page<T> page) {
        String sortBy = null;
        String sortDirection = null;

        if (page.getSort() != null && page.getSort().isSorted()) {
            var iterator = page.getSort().iterator();
            if (iterator.hasNext()) {
                var order = iterator.next();
                sortBy = order.getProperty();
                sortDirection = order.getDirection() != null ? order.getDirection().name() : null;
            }
        }

        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .numberOfElements(page.getNumberOfElements())
                .build();
    }

}
