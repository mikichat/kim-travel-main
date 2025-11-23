export default class AbstractView {
    constructor(params) {
        this.params = params;
    }

    setTitle(title) {
        document.title = title;
    }

    async getHtml() {
        return "";
    }

    async executeScript() {
        // Run any JS after HTML is inserted
    }
}
