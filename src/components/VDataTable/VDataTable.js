import '../../stylus/components/_tables.styl'
import '../../stylus/components/_data-table.styl'

import DataIterable from '../../mixins/data-iterable'

import Head from './mixins/head'
import Body from './mixins/body'
import Foot from './mixins/foot'
import Progress from './mixins/progress'

import {
  createSimpleFunctional,
  getObjectValueByPath
} from '../../util/helpers'

// Importing does not work properly
const VTableOverflow = createSimpleFunctional('table__overflow')

export default {
  name: 'v-data-table',

  data () {
    return {
      actionsClasses: 'datatable__actions',
      actionsRangeControlsClasses: 'datatable__actions__range-controls',
      actionsSelectClasses: 'datatable__actions__select',
      actionsPaginationClasses: 'datatable__actions__pagination'
    }
  },

  mixins: [DataIterable, Head, Body, Foot, Progress],

  props: {
    headers: {
      type: Array,
      default: () => []
    },
    headerText: {
      type: String,
      default: 'text'
    },
    hideHeaders: Boolean,
    rowsPerPageText: {
      type: String,
      default: 'Rows per page:'
    },
    customFilter: {
      type: Function,
      default: (items, search, filter, headers) => {
        search = search.toString().toLowerCase()
        if (search.trim() === '') return items

        const props = headers.map(h => h.value)

        return items.filter(item => props.some(prop => filter(getObjectValueByPath(item, prop), search)))
      }
    },
    expandIcon: {
      type: String,
      default: 'keyboard_arrow_down'
    }
  },

  computed: {
    classes () {
      return {
        'fixed-columns-table': this.getFixedColumnLeft(),
        'datatable table': true,
        'datatable--select-all': this.selectAll !== false,
        'theme--dark': this.dark,
        'theme--light': this.light
      }
    },
    filteredItems () {
      return this.filteredItemsImpl(this.headers)
    },
    headerColumns () {
      return this.headers.length + (this.selectAll !== false)
    }
  },

  methods: {
    hasTag (elements, tag) {
      return Array.isArray(elements) && elements.find(e => e.tag === tag)
    },
    genTR (children, data = {}) {
      return this.$createElement('tr', data, children)
    }
  },

  created () {
    const firstSortable = this.headers.find(h => (
      !('sortable' in h) || h.sortable)
    )

    this.defaultPagination.sortBy = !this.disableInitialSort && firstSortable
      ? firstSortable.value
      : null

    this.initPagination()
  },

  render (h) {
    const totalFixedWidth = this.getFixedColumnLeft()
    const tableOverflow = h(VTableOverflow, {
      // hard code to fix left columns with px unit for now
      style: totalFixedWidth ? { marginLeft: `${totalFixedWidth}px` } : {}
    }, [
      h('table', {
        'class': this.classes
      }, [
        this.genTHead(),
        this.genTBody(),
        this.genTFoot()
      ])
    ])

    return h('div', {
      'class': 'v-datatable-root'
    }, [
      tableOverflow,
      this.genActionsFooter()
    ])
  }
}
