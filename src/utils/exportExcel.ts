import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

export const exportExcel = (data: any[], filename: string = 'rank.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('My Sheet');
  worksheet.columns = Object.keys(data[0]).map((key) => {
    return {
      header: key,
      key: key,
      width: 15,
    };
  });

  worksheet.addRows(data);
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, filename);
  });
};
