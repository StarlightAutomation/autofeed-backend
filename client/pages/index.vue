<template>
  <div class="w-full md:w-2/3 ml-auto mr-auto md:px-0 px-3">
    <h1 class="text-2xl mt-5 border-b pb-2">DIYAutoFeed Control</h1>

    <div class="mt-3 border border-dashed border-blue-500 p-3">
      <h1 class="text-lg border-b border-blue-300 pb-1">Current Status</h1>
      <div class="mt-2">
        {{ currentTime }}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
        <div>
          Egress Pump:
          <font-awesome-icon :icon="['fas', 'times-circle']" class="text-red-500 ml-3" />
        </div>
        <div>
          Stir Pump:
          <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500 ml-3" />
        </div>
        <div>
          Main Valve:
          <font-awesome-icon :icon="['fas', 'times-circle']" class="text-red-500 ml-3" />
        </div>
        <div>
          Aeration Pump:
          <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500 ml-3" />
        </div>
      </div>
    </div>

    <div class="mt-3">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-7">
        <button
          v-for="template in scheduleTemplate" :key="template.id"
          :class="dayButtonClass(template.id)"
          @click="selectedDay = template.id"
        >{{ template.name }}</button>
      </div>
    </div>

    <div class="mt-3">
      <Schedule
        :schedule="selectedSchedule"
        :gpio="gpio"
        :day="selectedDay"
      />
    </div>
  </div>
</template>
<script>
import Schedule from "../components/Schedule";
import moment from "moment";

export default {
  name: 'IndexPage',
  components: {Schedule},
  data () {
    return {
      currentTimeInterval: undefined,
      currentTime: moment().format('dddd MMM Do - hh:mm:ss A z'),
      selectedDay: moment().format('dddd').toLowerCase(),
      scheduleTemplate: [
        {
          id: "monday",
          name: "Monday",
        },
        {
          id: "tuesday",
          name: "Tuesday",
        },
        {
          id: "wednesday",
          name: "Wednesday",
        },
        {
          id: "thursday",
          name: "Thursday",
        },
        {
          id: "friday",
          name: "Friday",
        },
        {
          id: "saturday",
          name: "Saturday",
        },
        {
          id: "sunday",
          name: "Sunday",
        },
      ]
    };
  },
  computed: {
    selectedSchedule () {
      const filtered = this.$store.getters['api/schedules'].filter((schedule) => schedule.id === this.selectedDay);
      const schedule = filtered[0] || {};

      if (schedule.copy) {
        return { ...(this.$store.getters['api/schedules'].filter((copied) => copied.id === schedule.copy)[0]) || {}, ...schedule };
      }

      return schedule;
    },
    gpio () {
      return this.$store.getters['api/config'].gpio;
    },
  },
  methods: {
    dayButtonClass (day) {
      const style = [
        'text-center',
        'px-3',
        'py-1.5',
        'rounded',
        'border',
        'border-blue-700',
        'text-gray-100',
      ];

      if (day === this.selectedDay) {
        style.push(...[
          'cursor-default',
          'bg-blue-500',
        ]);
      } else {
        style.push(...[
          'bg-blue-600',
          'hover:bg-blue-500',
        ]);
      }

      return style.join(' ');
    }
  },
  mounted () {
    this.selectedDay = moment().format('dddd').toLowerCase();
    this.currentTimeInterval = setInterval(() => {
      this.currentTime = moment().format('dddd MMM Do - hh:mm:ss A z')
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.currentTimeInterval);
  }
};
</script>
