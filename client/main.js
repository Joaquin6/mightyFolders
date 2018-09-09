Vue.config.devtools = false;
Vue.config.productionTip = false;
console.log('Loading mightyFolders...');
loadUniversalJSXLibraries()
loadJSX('mightyFolders.jsx')

window.Event = new class {
  constructor() {
    this.vue = new Vue()
  }
  fire(event, data = null) {
    this.vue.$emit(event, data);
  }
  listen(event, callback) {
    this.vue.$on(event, callback);
  }
}

Vue.component('background', {
  template: `
    <div class="background"></div>
  `,
})

Vue.component('branch', {
  template: `
  <li>
    <div
      class="collapseCol"
      @click="collapseThis"
      @mouseover="highlightCollapse">
    </div>
    <div :class="(hasFocus) ? 'focus' : 'noFocus'">
      <div
        :class="(highlight) ? styleHigh : styleHighFocus"
        @click="toggle"
        @mouseover="ifLocked ? nulli : highlightThis(true)"
        @mouseout="ifLocked ? nulli : highlightThis(false)">
        <div :class="open ? 'branch-angleDown' : 'branch-angleRight'">
          <span v-if="isFolder" :class="open ? 'adobe-icon-angleDown' : 'adobe-icon-angleRight'"></span>
          <span v-if="!isFolder" class="angleNull"></span>
        </div>
        <div class="branch-type">
          <span :class="isFolder ? 'adobe-icon-folder' : 'adobe-icon-file'"></span>
        </div>
        <span class="branch-name">{{ model.name }}</span>
      </div>
      <ul class="childBranch" v-show="open" v-if="isFolder">
        <div class="limitMar">
          <div :class="open ? 'marMax' : 'marMin'"
          v-if="!ifLocked"
          @click="toggle"
          @mouseover="highlightThis(true)"
          @mouseout="highlightThis(false)"></div>
          <branch
            class="branch"
            v-for="(model, index) in model.children"
            :key="index"
            :model="model">
          </branch>
        </div>
      </ul>
    </div>
  </li>
  `,
  props: {
    model: Object
  },
  data: function () {
    return {
      open: false,
      highlight: false,
      hasFocus: '',
      geneRoot: '',
      geneList: [],
    }
  },
  created: function() {
    if(this.model.children &&
        this.model.children.length){
      this.model.children.sort(function(a,b){
         return !(a.children && a.children.length);
      });
    }
  },
  computed: {
    ifLocked: function() {
      if (!this.$root.isLocked) {
        return false;
      } else {
        return true;
      }
    },
    styleHighFocus: function() {
      var foci = (this.hasFocus) ? 'branch-active' : 'branch-idle';
      var sele = (this.highlight) ? 'branch-parentHighlight' : 'branch-parentDef';
      // console.log(foci + " " + sele);
      return foci + " " + sele
    },
    styleHigh: function() {
      var foci = (this.hasFocus) ? 'branch-active' : 'branch-idle';
      var sele = 'branch-parentHighlight';
      // console.log(foci + " " + sele);
      return foci + " " + sele
    },
    isFolder: function (){
      return this.model.children &&
        this.model.children.length;
    },
    geneology: function() {
      var result = '';
      for (var i = 0; i < this.geneList.length; i++) {
        var target = this.geneList[i];
        if (i > 0) {
          if (i == this.geneList.length - 1) {
            result += target
          } else {
            result += target + '/'
          }
        } else {
          result += './'
        }
      }
      this.geneList = [];
      return result;
    },
  },
  methods: {
    getAncestry: function(parent) {
        if (parent.$children.length) {
          for (var i = 0; i < parent.$children.length; i++) {
            if (parent.$children[i] !== this.geneRoot) {
              if (parent.$children[i].$children.length)
                this.getAncestry(parent.$children[i])
            } else {
              this.familyTree = [];
              this.traceAncestry(this.geneRoot)
            }
          };
        }
    },
    traceAncestry: function(gene) {
      this.geneList.unshift(gene.model.name)
      if (gene.$parent !== gene.$root) {
        this.traceAncestry(gene.$parent)
      }
    },
    nulli: function() {
      // console.log('nothing happens');
    },
    locked: function(e) {
      console.log('This is locked, no pass through');
    },
    toggle: function(e) {
      if (!this.$root.isLocked) {
        this.setFocus(e);
        this.geneRoot = this;
        this.getAncestry(this.$root)
        this.$root.masterText = this.geneology
        if (this.isFolder) {
          this.open = !this.open;
        }
        console.log('Not locked');
      } else {
        console.log('Locked');
      }
    },
    highlightThis: function(state) {
      if (state) {
        this.highlight = true;
      } else {
        this.highlight = false;
      }
    },
    highlightCollapse: function() {

    },
    setFocus : function(e) {
      if (!this.hasFocus) {
        this.clearFocus(this.$root);
        this.hasFocus = true;
        this.$root.selected = e.currentTarget;
      }
    },
    clearFocus: function(parent) {
        if (parent.$children.length) {
          for (var i = 0; i < parent.$children.length; i++) {
            var targ = parent.$children[i];
            targ.hasFocus = false;
            this.clearFocus(targ);
          };
        }
    },
    collapseThis: function(e) {
      console.log(e);
    },
  },
})


Vue.component('treetools', {
  props: ['path'],
  template: `
  <div class="treeTools">
    <lift path="path"></lift>
    <lock path="path"></lock>
  </div>
  `
})

Vue.component('lock', {
  props: ['path'],
  template: `
  <div class="lockwrap"
    @click="checker"
    @mouseover="highlight = true"
    @mouseout="highlight = false">
    <div :class="(this.$root.isLocked) ? 'lockbtn-on' : 'lockbtn'">
      <span class="adobe-icon-lock"></span>
    </div>
  </div>
  `,
  // <div class="lockwrap" >
  data() {
    return {
      highlight: false,
    }
  },
  computed: {
    // LockandHigh: function() {
    //   var res = '';
    //   if (!this.ifLocked) {
    //     res = 'liftwrap'
    //     if (this.highlight) {
    //       res += ' liftHovwrap'
    //     }
    //   } else {
    //     res = 'liftwrap liftLock'
    //     console.log('locked...');
    //   }
    //   return res
    // }
  },
  methods: {
    checker: function(e) {
      // console.log('Checked:');
      // console.log(e);
      this.$root.isLocked = !this.$root.isLocked
      console.log(this.$root.isLocked);
    }
  }
})

Vue.component('lift', {
  props: ['path'],
  template: `
    <div :class="LockandHigh"
      @click="gotoParent"
      @mouseover="highlight = true"
      @mouseout="highlight = false">
      <div :class="highlight ? 'liftHov' : 'liftbtn'">
        <span class="adobe-icon-angleUp"></span>
      </div>
    </div>
  `,
  data() {
    return {
      highlight: false
    }
  },
  computed: {
    ifLocked: function() {
      if (!this.$root.isLocked) {
        return false;
      } else {
        return true;
      }
    },
    LockandHigh: function() {
      var res = '';
      if (!this.ifLocked) {
        res = 'liftwrap'
        if (this.highlight) {
          res += ' liftHovwrap'
        }
      } else {
        res = 'liftwrap liftLock'
        console.log('locked...');
      }
      // var high = this.;
      return res
    }
  },
  methods: {
    gotoParent: function() {
      Event.fire('toParent');
    }
  }
});

Vue.component('selector', {
  props: {
    model: String
  },
  template: `
    <div class="selectLine">
      <div class="selectPrefix">
        <div :class="(this.toggle.isSelect) ? 'xtag-select-active' : 'xtag-select-idle'" @click="setActive('select')">
          <span class="adobe-icon-cursor"></span>
        </div>
        <div :class="(this.toggle.isFind) ? 'xtag-find-active' : 'xtag-find-idle'" @click="setActive('find')">
          <span class="adobe-icon-find"></span>
        </div>
        <input :class="(toggle.isActive) ? 'select-input-active' : 'select-input-idle'" type="text" v-model="model">
      </div>
      <div class="selectSuffix">
        <div :class="(this.isPlus) ? 'xtag-plus-active' : 'xtag-plus-idle'" @click="setFavorite('plus')">
          <span class="adobe-icon-plus"></span>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      msg: 'app.selection',
      toggleList : ['isActive', 'isSelect', 'isFind'],
      toggle : {
        isActive: false,
        isSelect: false,
        isFind: false,
      },
      isPlus: false,
    }
  },
  methods : {
    setFavorite: function(lower) {
      var upper = lower.charAt(0).toUpperCase() + lower.substr(1);
      this.isPlus = !this.isPlus;
      if (this.isPlus)
        changeCSSVar('colorPlusIcon', getCSSVar('colorPlusActive'))
      else
        changeCSSVar('colorPlusIcon', getCSSVar('colorPlusIdle'))
      console.log(this.isPlus);
      console.log(getCSSVar('colorNoteIcon'));
    },
    setActive : function(lower) {
      var upper = lower.charAt(0).toUpperCase() + lower.substr(1);
      var lock = '';
      for (var m = 0; m < this.toggleList.length; m++) {
        var select = this.toggleList[m];
        if (select !== 'is' + upper) {
          this.toggle[select] = false;
        } else {
          this.toggle[select] = !this.toggle[select];
          lock = upper;
          if (this.toggle[select])
            changeCSSVar('color' + upper + 'Icon', getCSSVar('color' + upper + 'Active'))
          else
            changeCSSVar('color' + upper + 'Icon', getCSSVar('color' + upper + 'Idle'))
        }
      }
      for (var n = 0; n < this.toggleList.length; n++) {
        var select = trimL(this.toggleList[n], 2);
        if (select !== lock) {
          changeCSSVar('color' + select + 'Icon', '#a1a1a1')
        }
      }
    }
  }
})

var app = new Vue({
  el: '#app',
  data: {
    treeData: { name : 'Something went wrong.' },
    selected: 'none',
    masterText: 'Select a file',
    masterPath: sysPath,
    isLocked: false,
  },
  methods: {
    toParent: function() {
      var prev = this.masterPath;
      var newPath = prev.match(/.*\/.*(?=\/)/gm);
      newPath = newPath[0];
      console.log(newPath);
    },
    getData: function(path) {
      csInterface.evalScript(`callTree('${path}')`, this.setData)
    },
    setData: function(res) {
      this.treeData = JSON.parse(res);
    },
  },
  created() {
    var that = this;
    Event.listen('toParent', that.toParent)
    // Event.listen('toParent', function() {
    //   that.toParent();
    // })
  },
  mounted() {
    this.getData(`${this.masterPath}`)
  }
})


// var dirData = {
//   "name":"mightyFolders",
//   "children":
//   [
//     {"name":".debug"},
//     {"name":"client",
//     "children":[
//       {"name":"index.html"},
//       {"name":"main.js"},
//       {"name":"myTstack",
//       "children":[
//         {"name":"adobeStyle.css"},
//         {"name":"anima.css"},
//         {"name":"CSInterface.js"},
//         {"name":"eventManager.js"},
//         {"name":"fonts",
//         "children":[
//           {"name":"Adobe-Font.svg"},
//           {"name":"Adobe-Font.ttf"},
//           {"name":"Adobe-Font.woff"}
//         ]},
//         {"name":"magicMirror.js"},
//         {"name":"menu_Context.js"},
//         {"name":"menu_Flyout.js"},
//         {"name":"mightyFiles.js"},
//         {"name":"mightyFunctions.js"},
//         {"name":"ReqLibs.js"},
//         {"name":"reset.css"}
//       ]},
//       {"name":"style.css"}
//     ]},
//     {"name":"CSXS",
//     "children":[
//       {"name":"manifest.xml"}
//     ]},
//     {"name":"host",
//     "children":[
//       {"name":"mightyFolders.jsx"},
//       {"name":"universal",
//       "children":[
//         {"name":"Console.jsx"},
//         {"name":"json2.jsx"}
//       ]}
//     ]},
//     {"name":"icons",
//     "children":[
//       {"name":"iconLight.png"}
//     ]},
//   {"name":"LICENSE"},
//   {"name":"log",
//   "children":[
//     {"name":"scribe.js"}
//   ]},
//   {"name":"README.md"}]
// }



// if(this.model.children &&
//     this.model.children.length){
//   this.model.children.sort(function(a,b){
//      return !(a.children && a.children.length);
//   });
// }

// methods: {
//   getData: function(path) {
//     csInterface.evalScript(`callTree('${path}')`, function(e) {
//       this.treeData = JSON.parse(res)
//     })
//   },



// var sampdata = {
//   name: 'root folder',
//   children: [
//     { name: 'readme.md' },
//     { name: 'text.txt' },
//     {
//       name: 'child folder',
//       children: [
//         {
//           name: 'branch',
//           children: [
//             { name: 'potatoad.txt' },
//             { name: 'tuneshine.md' }
//           ]
//         },
//         { name: 'spineapple.txt' },
//         {
//           name: 'crops',
//           children: [
//             { name: 'plumpkin.txt' },
//             { name: 'cluecumber.js' }
//           ]
//         },
//         { name: 'lielax.txt' },
//       ]
//     }
//   ]
// }
