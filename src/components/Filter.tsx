import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import { GridFilterItem } from '@mui/x-data-grid';

import { Select, Button as Btn, Input, Space, DatePicker } from 'antd'
import type { TableColumnType, SelectProps } from 'antd';
import { FilterConfirmProps } from 'antd/es/table/interface';
import React, { useState } from 'react';

interface FilterItemProps<T> {
    dataIndex: keyof T
    filters: Record<string, GridFilterItem>
    handleSetFilters: (filters: Record<string, GridFilterItem>) => void
}

export default function getColumnSearchProps<T extends object>(dataIndex: keyof T, filters: Record<string, GridFilterItem>, handleSetFilters: (filters: Record<string, GridFilterItem>) => void): TableColumnType<T> {

    let filterOption = 'contains'
    // const searchInput = useRef<InputRef>(null);

    const filterOptions: Record<string, string> = {
        'contains': 'Contains',
        'equals': 'Equals',
        'startsWith': 'Starts with',
        'endsWith': 'Ends with',
        'isEmpty': 'Is empty',
        'isNotEmpty': 'Is not empty'
    }

    const filterOptionsArray: any = []
    Object.entries(filterOptions).forEach(([key, value]) => {
        filterOptionsArray.push({ label: value, value: key })
    });

    const handleReset = (clearFilters: () => void, confirm: (param?: FilterConfirmProps | undefined) => void, dataIndex: keyof T) => {
        clearFilters();
        confirm({ closeDropdown: false });
        let newFilters = { ...filters }
        Reflect.deleteProperty(newFilters, dataIndex);
        handleSetFilters(newFilters);
    };

    return ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center' }} >
                    <Select
                        defaultValue={filterOptionsArray[0]}
                        style={{ marginBottom: 8, marginRight: 6 }}
                        options={filterOptionsArray}
                        onChange={(value) => { filterOption = value; }}
                    />
                    <Input
                        // ref={searchInput}
                        placeholder={`Search ${dataIndex.toString()}`}
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                </div>
                <Space style={{ display: 'flex', alignItems: 'center'}}>
                    <Btn
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Btn>
                    <Btn
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            let newFilters = { ...filters }
                            newFilters[dataIndex.toString()] = {
                                columnField: dataIndex.toString(),
                                operatorValue: filterOption,
                                value: (selectedKeys as string[])[0],
                            }
                            handleSetFilters(newFilters);
                        }}
                    >
                        Apply
                    </Btn>
                    <Btn
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Btn>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <FilterAltRoundedIcon style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        // onFilter: (value, record) =>
        //     { console.log(filters);
        //     return record[dataIndex]
        //     .toString()
        //     .toLowerCase()
        //     .includes((value as string).toLowerCase())},
        // onFilterDropdownOpenChange: (visible) => {
        //     if (visible) {
        //         setTimeout(() => searchInput.current?.select(), 100);
        //     }
        // },
    })
};

type FilterSelectItemProp<T> = {
    dataIndex: keyof T,
    filters: Record<string, GridFilterItem>, 
    handleSetFilters: (filters: Record<string, GridFilterItem>) => void,
    options: string[]
}

export function getColumnSelectedItemFilter<T extends object>({ dataIndex, filters, handleSetFilters, options}: FilterSelectItemProp<T> ): TableColumnType<T> {

    let filterOption = 'isAnyOf'

    const handleReset = (clearFilters: () => void, confirm: (param?: FilterConfirmProps | undefined) => void, dataIndex: keyof T) => {
        clearFilters();
        confirm({ closeDropdown: false });
        let newFilters = { ...filters }
        Reflect.deleteProperty(newFilters, dataIndex);
        handleSetFilters(newFilters);
    };

    let selectOptions: SelectProps['options'] = options.map( item => ({
        value: item,
        label: item
    }))

    return ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Select
                    mode="tags"
                    placeholder="Please select"
                    value={selectedKeys}
                    onChange={(value) => setSelectedKeys(value)}
                    options={selectOptions}
                    style={{ display: 'block', marginBottom: 8, alignItems: 'center', width: 250}}
                />
                <Space style={{ display: 'flex', alignItems: 'center'}}>
                    <Btn
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Btn>
                    <Btn
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            let newFilters = { ...filters }
                            newFilters[dataIndex.toString()] = {
                                columnField: dataIndex.toString(),
                                operatorValue: filterOption,
                                value: selectedKeys,
                            }
                            console.log(newFilters)
                            if (selectedKeys.length === 0) {
                                clearFilters && handleReset(clearFilters, confirm, dataIndex);
                            } else {
                                handleSetFilters(newFilters);
                            }
                        }}
                    >
                        Apply
                    </Btn>
                    <Btn
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Btn>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <FilterAltRoundedIcon style={{ color: filtered ? '#1677ff' : undefined }} />
        ),

    })
};

export const getColumnDateFilter = <T extends object>({ dataIndex, filters, handleSetFilters }: FilterItemProps<T>): TableColumnType<T> => {
    return {
        filterDropdown: ({ confirm, clearFilters, close }) => (
            <DateFilterDropdown<T>
                dataIndex={dataIndex}
                filters={filters}
                handleSetFilters={handleSetFilters}
                confirm={confirm}
                clearFilters={clearFilters}
                close={close}
            />
        ),
        filterIcon: (filtered: boolean) => (
            <FilterAltRoundedIcon style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
    };
};

interface DateFilterDropdownProps<T> extends FilterItemProps<T> {
    confirm: (param?: FilterConfirmProps) => void;
    clearFilters?: () => void;
    close: () => void;
}

const DateFilterDropdown = <T extends object>({ dataIndex, filters, handleSetFilters, confirm, clearFilters, close }: DateFilterDropdownProps<T>) => {
    const [lower, setLower] = useState<string>('');
    const [upper, setUpper] = useState<string>('');

    const handleReset = () => {
        clearFilters && clearFilters();
        setLower('');
        setUpper('');
        confirm({ closeDropdown: false });
        let newFilters = { ...filters };
        Reflect.deleteProperty(newFilters, dataIndex);
        handleSetFilters(newFilters);
    };

    const handleApply = () => {
        confirm({ closeDropdown: false });
        let filter: GridFilterItem | null = null;
        if (lower && upper) {
            filter = { columnField: dataIndex.toString(), operatorValue: 'between', value: [lower, upper] }
        } else if (lower) {
            filter = { columnField: dataIndex.toString(), operatorValue: 'greaterThan', value: lower }
        } else if (upper) {
            filter = { columnField: dataIndex.toString(), operatorValue: 'lessThan', value: upper }
        }

        if (filter) {
            handleSetFilters({ 
                ...filters,
                [dataIndex.toString()]: filter,
            });
        }
    };

    return (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ margin: 2 }}>Visits After:</div>
                    <DatePicker onChange={(date, stringDate) => setLower(stringDate as string)} style={{ margin: 2, backgroundColor: 'white' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ margin: 2 }}>Visits Before:</div>
                    <DatePicker onChange={(date, stringDate) => setUpper(stringDate as string)} style={{ margin: 2, backgroundColor: 'white' }} />
                </div>
            </div>
            <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Btn onClick={handleReset} size="small" style={{ width: 90 }}>
                    Reset
                </Btn>
                <Btn size="small" onClick={handleApply}>
                    Apply
                </Btn>
                <Btn size="small" onClick={() => close()}>
                    Close
                </Btn>
            </Space>
        </div>
    );
};

export const getSortIcon = (field: string, order: 'ASC' | 'DESC' | undefined, handleSortingChange: (param: { field: string, order?: 'ASC' | 'DESC' }) => void) => {
    return (
        <div 
            style={{ alignItems: "center", display: "flex", flexDirection: "column" }}
            onClick={() => {
                let newOrder: 'ASC' | 'DESC' | undefined = 'ASC';
                if (order === 'ASC') newOrder = 'DESC';
                else if (order === 'DESC') newOrder = undefined;
                handleSortingChange({ field, order: newOrder });
            }}
        >
            <ArrowDropUp style={{ margin: "-8px 0" }} htmlColor={ order === 'ASC' ? '#00b96b' : "grey"}/>
            <ArrowDropDown style={{ margin: "-8px 0" }} htmlColor={ order === 'DESC' ? '#00b96b' : "grey"}/>
        </div>
    )
}