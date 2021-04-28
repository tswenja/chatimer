(function() {

  // models
  var chaModel = {
    data: function() {
      return {
        cha: {
          all: []
        }
      }
    },
    created: function() {
      var example = {
        name: "一號茶",
        icon: "assets/images/random.svg",
        times: [60, 30, 70]
      }
      this.cha.all = [example];
    }
  };


  // components
  const ChaTimer = {
    template: '#chatimer-template',
    //mixins: [chaModel],
    data: function() {
      return {
        name: "name",
        highlightClass: 'bg-yellow-200',
        round: 1,
        seconds: this.$route.query.seconds ? parseInt(this.$route.query.seconds) : 30,
        countingNumber: null,
        secondsModifier: null,
        state: {
          current: { waiting: true, counting: false, paused: false, completed: false }
        }
      }
    },
    created: function() {
      this.resetCountingNumber();
    },
    computed: {
      secondsModifyStep: function() {
        if (this.secondsModifier.step >= 0) return '+' + this.secondsModifier.step;
        else return this.secondsModifier.step;
      }
    },
    methods: {
      countdown: function() {
        this.countdownId = setTimeout(function() {
          if (this.state.current.counting && this.countingNumber > 0) {
            this.countingNumber = this.countingNumber - 1;

            if (this.countingNumber > 0) {
              this.countdownStepRemaining = 1000;
              this.countdownStart = Date.now();
              this.countdown();
            } else {
              this.complete();
            }
          }
        }.bind(this), this.countdownStepRemaining);
      },
      resume: function() {
        if (!this.state.current.paused) return;

        this.setState('counting');
        this.updateStyles();

        this.countdown();
      },
      wait: function() {
        this.resetCountingNumber();
        this.setState('waiting');
        this.updateStyles();
      },
      count: function() {
        if (!this.state.current.waiting) return;

        this.setState('counting');
        this.updateStyles();

        this.countdownStepRemaining = 1000;
        this.countdownStart = Date.now();
        this.countdown();
      },
      pause: function() {
        if (!this.state.current.counting) return;

        this.setState('paused');
        this.updateStyles();

        this.countdownStepRemaining -= Date.now() - this.countdownStart;
        clearTimeout(this.countdownId);
      },
      complete: function() {
        this.setState('completed');
        this.updateStyles();
      },
      edit: function() {
        // router.push({ path: '/edit', query: { seconds: this.seconds } });
      },
      nextRound: function() {
        this.resetCountingNumber();
        this.round += 1;
        this.setState('waiting');
        this.updateStyles();
      },
      setState: function(newState) {
        console.log(newState);
        let allStates = Object.keys(this.state.current);

        if (!allStates.includes(newState)) return false;

        allStates.forEach(function(key) {
          this.state.current[key] = false;
        }.bind(this));
        this.state.current[newState] = true;
      },
      updateStyles: function() {
        if (this.state.current.counting) {
          Vue.nextTick(function() {
            document.body.classList.add(this.highlightClass);
          }.bind(this));
        } else {
          Vue.nextTick(function() {
            document.body.classList.remove(this.highlightClass);
          }.bind(this));
        }
      },
      resetCountingNumber: function() {
        this.seconds = parseInt(this.seconds);
        this.countingNumber = this.seconds;
      },
      ontouchstart: function(e) {
        if (document.activeElement.tagName != 'BODY') document.activeElement.blur();
        this.touches = [e.touches[0]];
      },
      ontouchmove: function(e) {
        this.touches.push(e.touches[0]);
        var touchesCount = this.touches.length;
        var secondsDiff = parseInt((this.touches[touchesCount-1].clientY - this.touches[0].clientY) / 50);

        if (!this.secondsModifier && secondsDiff != 0) {
          this.secondsModifier = { step: -(secondsDiff) };

          this.secondsModifier['interval'] = setInterval(function() {
            this.resetCountingNumber();
          }.bind(this), 800);
        }

        if (this.secondsModifier) {
          this.secondsModifier['step'] = -(secondsDiff);
        }
      },
      ontouchend: function(e) {
        this.touches = null;
        if (this.secondsModifier) {
          this.seconds += this.secondsModifier['step'];
          clearInterval(this.secondsModifier['interval']);
          this.secondsModifier = null;
        }
      }
    }
  }

  const ChaTimerEditor = {
    template: '#chatimer-editor-template',
    data: function() {
      return {
        seconds: parseInt(this.$route.query.seconds)
      }
    },
    methods: {
      add: function(amount) {
        this.seconds += amount;
      },
      done: function() {
        router.push({ path: '/', query: { seconds: this.seconds } });
      }
    }
  }

  const ChaNumbers = {
    template: '#cha-numbers-template'
  }


  // routes
  const routes = [
    { path: '/', component: ChaTimer },
    { path: '/edit', component: ChaTimerEditor },
    { path: '/times', component: ChaNumbers }
  ]

  const router = new VueRouter({
    routes
  })

  var main = new Vue({
    router
  }).$mount('#main');


  //var main = new Vue({
  //  el: '#main',
  //  mixins: [chaModel],
  //  data: {
  //    currentStep: [0, 0],
  //    timer: {
  //      status: 0,
  //      number: 0
  //    }
  //  },
  //  computed: {
  //    currentCha: function() {
  //      return this.cha.all[this.currentStep[0]];
  //    }
  //  },
  //  methods: {
  //    setTimer: function(step) {
  //      if (!step) step = this.currentStep;
  //      this.timer.number = this.cha.all[step[0]].times[step[1]];
  //    }
  //  },
  //  created: function() {
  //    this.setTimer();
  //  }
  //});

  //const Timer = {
  //  template: '#timer-template',
  //  mixins: [chaModel],
  //  data: function() {
  //    return {
  //      name: "name",
  //      state: 'ready',
  //      number: 30
  //    }
  //  },
  //  created: function() {
  //    var step;
  //    if (!step) step = [0,0];
  //    this.name = this.cha.all[step[0]].name;
  //    this.number = this.cha.all[step[0]].times[step[1]];
  //  },
  //  computed: {
  //    ready: function() {
  //      return this.state == 'ready';
  //    },
  //    editing: function() {
  //      return this.state == 'editing';
  //    },
  //    counting: function() {
  //      return this.state == 'counting';
  //    }
  //  },
  //  methods: {
  //    add: function(amount) {
  //      this.number += amount;
  //    }
  //  }
  //}

}());
