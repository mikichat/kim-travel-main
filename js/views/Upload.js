import AbstractView from '../core/AbstractView.js';

export default class Upload extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Upload");
    }

    async getHtml() {
        return `
            <div class="card">
                <h2>Excel Upload</h2>
                <div class="form-group">
                    <label>그룹명</label>
                    <input type="text" id="headerGroupName" placeholder="그룹명 입력..." style="padding: 10px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; width: 100%;">
                </div>
                 <div class="form-group">
                     <button class="btn btn-warning" onclick="document.getElementById('excelUpload').click()">
                        <i class="fas fa-file-upload"></i> 엑셀 업로드
                    </button>
                    <input type="file" id="excelUpload" accept=".xlsx,.xls" style="display: none;">
                 </div>
            </div>
        `;
    }

    async executeScript() {
        const fileInput = document.getElementById('excelUpload');
        if (fileInput) {
            fileInput.addEventListener('change', async (event) => {
                 // Reuse logic from schedules.html or app.js
                 // For now, we just log. The logic needs to be imported or re-implemented.
                 console.log("File selected");
            });
        }
    }
}
