/**
 * Object with data-attributes (HTML5) with a special <markup>
 *
 * @namespace LUNGO
 * @class Constants
 *
 * @author Javier Jimenez Villar <javi@tapquo.com> || @soyjavi
 * @author Guillermo Pascual <pasku@tapquo.com> || @pasku1
 */

LUNGO.Constants = {

    ELEMENT: {
        SECTION: 'section',
        ARTICLE: 'article',
        ASIDE: 'aside',
        BODY: 'body',
        DIV: 'div',
        LIST: '<ul></ul>',
        SPAN: '<span>&nbsp;</span>'
    },

    CLASS: {
        ACTIVE: 'active',
        ASIDE: 'aside',
        SHOW: 'show',
        SHOW_REVOKE: 'show-revoke',
        HIDE: 'hide',
        HIDE_REVOKE: 'hide-revoke',
        CURRENT: 'current',
        RIGHT: 'onright',
        LEFT: 'onleft',
        HORIZONTAL: 'horizontal',
        FLOW: 'flow'
    },

    TRIGGER: {
        LOAD: 'load',
        UNLOAD: 'unload'
    },

    ATTRIBUTE: {
        ID: 'id',
        HREF: 'href',
        TITLE: 'title',
        ARTICLE: 'article',
        CLASS: 'class',
        WIDTH: 'width',
        HEIGHT: 'height',
        PIXEL: 'px',
        PERCENT: '%',
        TARGET: 'target',
        FIRST: 'first',
        LAST: 'last',
        EMPTY: ''
    },

    BINDING: {
        START: '{{',
        END: '}}',
        KEY: 'value',
        PARSER: /\{{.*?\}}/gi
    },

    ERROR: {
        CREATE_SCROLL: 'ERROR: Impossible to create a <scroll> without ID.',
        BINDING_DATA_TYPE: 'ERROR: Processing the type of binding data.',
        BINDING_TEMPLATE: 'ERROR: Binding Template not exists >> ',
        BINDING_LIST: 'ERROR: Processing parameters for list binding.',
        DATABASE: 'ERROR: Connecting to Data.Sql.',
        ROUTER: 'ERROR: The target does not exists >>',
        LOADING_RESOURCE: 'ERROR: Loading resource.'
    }

};