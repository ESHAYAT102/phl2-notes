'use client';

import { BorderBeam } from 'border-beam';
import { useDocsSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search';

export function DocsSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { search, setSearch, query } = useDocsSearch({ type: 'fetch' });

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
    >
      <SearchDialogOverlay />
      <SearchDialogContent className="search-dialog-content">
        <BorderBeam
          active={open}
          className="search-dialog-beam"
          colorVariant="colorful"
          duration={4}
          size="md"
          strength={0.75}
        >
          <div className="search-dialog-surface">
            <SearchDialogHeader>
              <SearchDialogIcon />
              <SearchDialogInput autoFocus />
              <SearchDialogClose />
            </SearchDialogHeader>
            <SearchDialogList items={query.data === 'empty' ? null : query.data} />
          </div>
        </BorderBeam>
      </SearchDialogContent>
    </SearchDialog>
  );
}
