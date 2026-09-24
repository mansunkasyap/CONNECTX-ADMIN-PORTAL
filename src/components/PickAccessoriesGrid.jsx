import React, { memo, useEffect, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Button, Col, Row } from 'react-bootstrap';
import { Pagination, Stack, TextField } from '@mui/material';
import { debounce } from 'lodash';
import { CommonController } from './CommonController';
const PickAccessoriesGrid = ({
  url, //api url
  body, //api body request
  columns, //column header //height
  data, //parent to child data transfer
  close,
  id,
  pickId,
  selectType = true,
  pickModalTitle,
  resize
}) => {
  const [sorting, setSorting] = useState([]);
  const [search, setsearch] = useState('');
  const [browseListData, setBrowseListData] = useState([]);
  const [allBrowseListData, setAllBrowseListData] = useState([]);
  const [totalRecord, setTotalRecords] = useState(null);
  const [rowSelection, setRowSelection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [param, setparam] = useState({
    page_number: 1,
    page_size: 50,
    sort_column: '',
    sort_order: 'no',
  });

  const getBrowseListData = async (value) => {
    const obj = { ...body };
    obj.p_search = value;
    await CommonController.commonBrowseApiCallNew(url, obj, param, 'node')
      .then((data) => {
        if (data.valid) {
          setLoading(false);
          setBrowseListData(data.data);
          setAllBrowseListData([
            ...new Set([...allBrowseListData, ...data.data]),
          ]);
          setTotalRecords(data.totalRecords);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };


  // const getBrowseListData = async (value) => {
  //   const obj = { ...body };
  //   obj.filter_value = value;

  //   try {
  //     const data = await CommonController.commonBrowseApiCallNew(url, obj, param, 'node');

  //     if (data.valid) {
  //       setLoading(false);

  //       setBrowseListData(data.data);
  //         setAllBrowseListData((prevData) => {
  //         const existingIds = new Set(prevData.map((item) => item.id));
  //         const newData = data.data.filter((item) => !existingIds.has(item.id));
  //         return [...prevData, ...newData];
  //       });

  //       setTotalRecords(data.totalRecords);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // const handleSelectItem = (item) => {
  //   setSelectedItems((prevSelected) => {
  //     const existingIds = new Set(prevSelected.map((i) => i.id));

  //     if (!existingIds.has(item.id)) {
  //       return [...prevSelected, item]; 
  //     }
  //     return prevSelected;
  //   });
  // };
  const handleSearch = (e) => {
    setsearch(e.target.value);
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getBrowseListData(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    getBrowseListData(search);
    setRowSelection(pickId);
  }, [param]);
  const shortFun = () => {
    if (sorting.length > 0) {
      if (sorting[0].desc) {
        setparam({ ...param, sort_column: sorting[0].id, sort_order: 'desc' });
      } else {
        setparam({ ...param, sort_column: sorting[0].id, sort_order: 'asc' });
      }
    }
  };
  useEffect(() => {
    shortFun();
  }, [sorting]);
  function setupPagination() {
    return Math.ceil(totalRecord / param.page_size);
  }
  return (
    <Col
      md={12}
      className="common__data__grid__wrapper single_header_left_align_header center_aligned_top_input"
    >
      <Row className="d-flex justify-content-end  ">
        <Col>
          <strong className="fs-4 m-0">{pickModalTitle}</strong>
        </Col>
        <Col md={3} className="justify-content-end ">
          <TextField
            fullWidth
            size="small"
            label="Search"
            onChange={handleSearch}
            value={search}
            variant="outlined"
            autoComplete="off"
          />
        </Col>
      </Row>
      <div className="data_table_height mt-3">
        <MaterialReactTable
          // enableEditing={true}
          enableMultiRowSelection={selectType}
          enableRowSelection
          getRowId={(row) => row[id]}
          columns={columns}
          enableBottomToolbar={false}
          enableTopToolbar={false}
          data={browseListData}
          enableColumnActions={false}
          manualFiltering
          enableColumnFilterModes
          enablePagination={false}
          enableColumnFilters={false}
          enableGlobalFilter={false}
          enableSorting
          enableFullScreenToggle={false}
          enableColumnResizing={resize}
          enableHiding={true}
          onSortingChange={setSorting}
          enableStickyHeader
          manualSorting
          enableDensityToggle={true}
          initialState={{
            density: 'compact',
            sorting,
          }} //
          state={{
            rowSelection,
            isLoading: loading,
            sorting,
          }}
          onRowSelectionChange={setRowSelection}
          muiTableBodyProps={{
            sx: {
              '& tr:nth-of-type(odd)': {
                backgroundColor: '#e2e2e2',
              },
              '& .MuiTableCell-root': {
                borderLeft: '1px solid #cacaca',
                borderBottom: '1px solid #cacaca',
                overflowWrap: 'break-word',
                whiteSpace: 'unset',
              },
            },
          }}
          //   //   muiTableContainerProps={{ sx: { maxHeight: "calc(100vh - 295px)" } }}
          muiTableContainerProps={{
            sx: { height: '400px' },
          }}
        />
      </div>

      <div className="pagination_wrap mt-3">
        {' '}
        {/* Added mt-3 class for margin-top */}
        <div className="row">
          <div className="col">
            <div className="d-flex justify-content-start align-items-center">
              <label>Row per page: </label>
              <select
                value={param.page_size + 1}
                onChange={(event) => {
                  if (parseInt(event.target.value) > 0) {
                    setparam({
                      ...param,
                      page_size: parseInt(event.target.value - 1),
                      page_number: 0,
                    });
                  }
                }}
              >
                <option value="10">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="400">400</option>
              </select>
            </div>
          </div>
          <div className="col">
            <div className="d-flex justify-content-end align-items-center">
              <label>Go to page: </label>
              <input
                type="number"
                defaultValue={param.page_number + 1}
                onChange={(event) => {
                  if (parseInt(event.target.value) > 0) {
                    setparam({
                      ...param,
                      page_number: parseInt(event.target.value - 1),
                    });
                  }
                }}
                style={{ width: '50px' }}
              />
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center align-items-center pages">
          <Stack spacing={2}>
            <Pagination
              count={setupPagination()}
              color="primary"
              page={param.page_number + 1}
              onChange={(event, value) => {
                setparam({ ...param, page_number: value - 1 });
              }}
              nextIconButtonProps={{ children: 'Next' }}
              prevIconButtonProps={{ children: 'Prev' }}
            />
          </Stack>
        </div>
      </div>

      <div className="text-end py-2">
        <Button
          onClick={() => close(false)}
          color="primary"
          disableElevation
          variant="contained"
          className="canclebutton text-dark m3-2"
        >
          Cancel
        </Button>
        <Button
          color="primary"
          className="savebutton text-white text-dark"
          disableElevation
          variant="contained"
          onClick={() => {
            if (rowSelection) {
              if (selectType) {
                // data(browseListData.filter(val => val[id] == Object.keys(rowSelection)[0])[0], rowSelection);
                data(
                  allBrowseListData.filter((val) =>
                    rowSelection[val[id]] ? true : false
                  ),
                  rowSelection
                );
                close(false);
              } else {
                data(
                  browseListData.filter(
                    (val) => val[id] == Object.keys(rowSelection)[0]
                  )[0],
                  rowSelection
                );
                close(false);
              }
            }
          }}
        >
          Done
        </Button>
      </div>
    </Col>
  );
};
export default memo(PickAccessoriesGrid);
