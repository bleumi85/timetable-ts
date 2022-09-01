import {
    AddIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TriangleDownIcon,
    TriangleUpIcon
} from '@chakra-ui/icons';
import {
    Button,
    Center,
    Checkbox,
    CheckboxProps,
    Flex,
    IconButton,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Stack,
    Table,
    TableProps,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr
} from '@chakra-ui/react';
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    RowSelectionState,
    TableState,
    useReactTable
} from '@tanstack/react-table';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export function useTable<T>(data: T[], columns: ColumnDef<T, any>[], enableColumnFilters: boolean = true, initialColumnFilters: ColumnFiltersState = [], selectable: boolean = false) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const myColumns = useMemo<ColumnDef<T>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Center>
                        <IndeterminateCheckbox
                            isChecked={table.getIsAllRowsSelected()}
                            isIndeterminate={table.getIsSomeRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                            colorScheme='white'
                        />
                    </Center>
                ),
                cell: ({ row }) => (
                    <Center>
                        <IndeterminateCheckbox
                            isChecked={row.getIsSelected()}
                            isIndeterminate={row.getIsSomeSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            borderColor='secondary.500'
                            colorScheme='secondary'
                        />
                    </Center>
                ),
                enableSorting: false,
                enableColumnFilter: false
            },
            ...columns
        ], [columns]
    )

    const table = useReactTable({
        data,
        columns: selectable ? myColumns : columns,
        state: {
            columnFilters,
            rowSelection,
        },
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: false,
        enableColumnFilters
    });

    const onReset = () => {
        table.setColumnFilters(initialColumnFilters);
        table.setSorting([]);
        table.setRowSelection({});
        table.setPagination({
            pageIndex: 0,
            pageSize: 10
        });
    }

    const TblFilter = (props: { children?: React.ReactElement }): JSX.Element => (
        <Stack direction='row' w='100%' spacing={4} justifyContent='flex-end'>
            <Stack direction='row' flexGrow={1} spacing={4}>
                {table.getHeaderGroups().map(headerGroup => {
                    return headerGroup.headers.map((header) => {
                        return (
                            header.column.getCanFilter() ? (
                                <Filter key={header.id} column={header.column} />
                            ) : null
                        )
                    })
                })}
            </Stack>
            {enableColumnFilters && <Button minW={100} colorScheme='secondary' onClick={onReset}>Reset</Button>}
            <Link to='add'>
                <IconButton
                    aria-label='add'
                    colorScheme='primary'
                    icon={<AddIcon />}
                />
            </Link>
            {props.children}
        </Stack>
    );

    const TblContainer = React.forwardRef<HTMLTableElement, TableProps>(
        (props, ref) => {
            const { children, ...delegated } = props;

            return (
                <Flex p={2} bg='whiteAlpha.900' boxShadow='md'>
                    <Table ref={ref} size='sm' variant='striped' {...delegated}>
                        {children}
                    </Table>
                </Flex>
            )
        }
    );

    const TblHead = (): JSX.Element => (
        <Thead bg='secondary.500'>
            {table.getHeaderGroups().map(headerGroup => (
                <Tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                        return (
                            <Th key={header.id} colSpan={header.colSpan} color='white' py={4}>
                                {header.isPlaceholder ? null : (
                                    <>
                                        <div
                                            {...{
                                                onClick: header.column.getToggleSortingHandler(),
                                            }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: <TriangleUpIcon ml={2} />,
                                                desc: <TriangleDownIcon ml={2} />
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </>
                                )}
                            </Th>
                        )
                    })}
                </Tr>
            ))}
        </Thead>
    );

    const TblBody = (): JSX.Element => (
        <Tbody>
            {table.getRowModel().rows.map(row => {
                return (
                    <Tr key={row.id}>
                        {row.getVisibleCells().map(cell => {
                            return (
                                <Td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </Td>
                            )
                        })}
                    </Tr>
                )
            })}
        </Tbody>
    );

    const TblPagination = (): JSX.Element => (
        <Flex justifyContent='space-between' m={4} alignItems='center'>
            <Flex>
                <Tooltip label='Erste Seite'>
                    <IconButton
                        aria-label='first page'
                        icon={<ArrowLeftIcon h={3} w={3} />}
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        mr={4}
                    />
                </Tooltip>
                <Tooltip label='Vorherige Seite'>
                    <IconButton
                        aria-label='previous page'
                        icon={<ChevronLeftIcon h={6} w={6} />}
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    />
                </Tooltip>
            </Flex>
            <Flex alignItems='center'>
                <Text flexShrink={0} mr={8}>
                    Seite{" "}
                    <Text fontWeight='bold' as='span'>
                        {table.getState().pagination.pageIndex + 1}
                    </Text>{" "}
                    von{" "}
                    <Text fontWeight='bold' as='span'>
                        {table.getPageCount()}
                    </Text>
                </Text>
                <Text flexShrink={0}>Gehe zu Seite:</Text>{" "}
                <NumberInput
                    ml={2} mr={8} w={28} min={1} max={table.getPageCount()}
                    onChange={(value) => {
                        const page = value ? Number(value) - 1 : 0;
                        table.setPageIndex(page)
                    }}
                    defaultValue={table.getState().pagination.pageIndex + 1}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Select
                    w={32}
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 25, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Zeige {pageSize}
                        </option>
                    ))}
                </Select>
            </Flex>
            <Flex>
                <Tooltip label='Vorherige Seite'>
                    <IconButton
                        aria-label='next page'
                        icon={<ChevronRightIcon h={6} w={6} />}
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    />
                </Tooltip>
                <Tooltip label='Erste Seite'>
                    <IconButton
                        aria-label='last page'
                        icon={<ArrowRightIcon h={3} w={3} />}
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        mr={4}
                    />
                </Tooltip>
            </Flex>
        </Flex>
    );

    const TblJson = (): JSX.Element => {
        const state: TableState = table.getState();
        const data = {
            'columnFilters': state.columnFilters,
            'sorting': state.sorting,
            'pagination': state.pagination,
            'rowSelection': state.rowSelection
        }
        return (
            <pre>{JSON.stringify(data, null, 2)}</pre>
        )
    }

    return {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination, TblJson
    }
};

function Filter({ column }: { column: Column<any, unknown> }): JSX.Element {
    const columnFilterValue = column.getFilterValue();

    const sortedUniqueValues = useMemo(() => Array.from(column.getFacetedUniqueValues().keys()).sort(), [column]);
    const heading = column.columnDef.header === '' ? 'Suche' : column.columnDef.header;

    return (
        <>
            <Select
                borderColor='secondary.500'
                maxW='300px'
                placeholder={`${heading}... (${column.getFacetedUniqueValues().size})`}
                value={(columnFilterValue ?? '') as string}
                onChange={(e) => column.setFilterValue(e.target.value)}
            >
                {sortedUniqueValues.map((value: any) => (
                    <option key={value}>{value}</option>
                ))}
            </Select>
        </>
    )
}

function IndeterminateCheckbox(props: CheckboxProps) {
    const ref = React.useRef<HTMLInputElement>(null!);
    const { isIndeterminate, isChecked, ...rest } = props;

    React.useEffect(() => {
        if (typeof isIndeterminate === 'boolean') {
            ref.current.indeterminate = !rest.checked && isIndeterminate
        }
    }, [ref, isIndeterminate, rest.checked])

    return (
        <Checkbox
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            ref={ref}
            {...rest}
        />
    )
}