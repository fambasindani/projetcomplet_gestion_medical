package adc.gestion_hospitaliere.dto.pagination;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResult<T> {
    private List<T> items;
    private int pageIndex;
    private int pageSize;
    private long totalCount;
    private int totalPages;
    private boolean hasPreviousPage;
    private boolean hasNextPage;
}