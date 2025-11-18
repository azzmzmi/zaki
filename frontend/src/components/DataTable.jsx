import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  pagination = null,
  onPageChange = () => {},
  onSearch = () => {},
  searchPlaceholder = 'Search...',
  actions = null,
  rowKey = 'id',
}) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value) => {
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            data-testid="data-table-search"
          />
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No data found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {column.label}
                    </th>
                  ))}
                  {actions && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t('common.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((row, rowIndex) => (
                  <tr key={row[rowKey] || rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {columns.map((column) => (
                      <td
                        key={`${row[rowKey]}-${column.key}`}
                        className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">{actions(row)}</div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('pagination.page')} {pagination.page} {t('pagination.of')} {pagination.pages} • {pagination.total}{' '}
            {pagination.total === 1 ? 'item' : 'items'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              data-testid="pagination-prev"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('pagination.previous')}
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-10"
                    data-testid={`pagination-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              data-testid="pagination-next"
            >
              {t('pagination.next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
