import url from 'url';

export default class {
    static render(name) {
        location.href = `${name}.html`;
    }

    static parameters() {
        return url.parse(window.location.search, true).query;
    }
}
