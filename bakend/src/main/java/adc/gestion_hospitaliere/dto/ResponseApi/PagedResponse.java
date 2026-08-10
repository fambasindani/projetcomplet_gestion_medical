package adc.gestion_hospitaliere.dto.ResponseApi;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> items;
    private int pageIndex;     // commence à 1
    private int pageSize;
    private long totalCount;
    private int totalPages;
    private boolean hasPreviousPage;
    private boolean hasNextPage;

    public static <T> PagedResponse<T> of(Page<T> page) {
        return PagedResponse.<T>builder()
                .items(page.getContent())
                .pageIndex(page.getNumber() + 1)   // conversion 0 → 1
                .pageSize(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasPreviousPage(page.hasPrevious())
                .hasNextPage(page.hasNext())
                .build();
    }
}