<template>
  <div class="w-full md:w-2/3 ml-auto mr-auto md:px-0 px-3">
    <h1 class="text-2xl mt-5 border-b pb-2">
      DIYAutoFeed Control
    </h1>

    <div class="mt-3 border border-dashed border-blue-500 p-3">
      <h1 class="text-lg border-b border-blue-300 pb-1">
        Current Status
      </h1>
      <div class="mt-2">
        {{ currentTime }}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
        <div>
          Egress Pump:
          <div class="inline-block">
            <font-awesome-icon v-if="deviceStatus.egress.status === undefined" :icon="['fas', 'spinner']" spin class="text-gray-600 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.egress.status === true" :icon="['fas', 'check-circle']" class="text-green-500 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.egress.status === false" :icon="['fas', 'times-circle']" class="text-red-500 ml-3 w-4 h-4 inline" />
            <ToggleSwitch
              class="inline"
              :enabled="deviceStatus.egress.status === true"
              @toggle="(enabled) => toggleDeviceState(deviceStatus.egress.id, enabled)"
            />
          </div>
        </div>
        <div>
          Stir Pump:
          <div class="inline-block">
            <font-awesome-icon v-if="deviceStatus.stirPump.status === undefined" :icon="['fas', 'spinner']" spin class="text-gray-600 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.stirPump.status === true" :icon="['fas', 'check-circle']" class="text-green-500 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.stirPump.status === false" :icon="['fas', 'times-circle']" class="text-red-500 ml-3 w-4 h-4 inline" />
            <ToggleSwitch
              class="inline"
              :enabled="deviceStatus.stirPump.status === true"
              @toggle="(enabled) => toggleDeviceState(deviceStatus.stirPump.id, enabled)"
            />
          </div>
        </div>
        <div>
          Main Valve:
          <div class="inline-block">
            <font-awesome-icon v-if="deviceStatus.mainValve.status === undefined" :icon="['fas', 'spinner']" spin class="text-gray-600 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.mainValve.status === true" :icon="['fas', 'check-circle']" class="text-green-500 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.mainValve.status === false" :icon="['fas', 'times-circle']" class="text-red-500 ml-3 w-4 h-4 inline" />
            <ToggleSwitch
              class="inline"
              :enabled="deviceStatus.mainValve.status === true"
              @toggle="(enabled) => toggleDeviceState(deviceStatus.mainValve.id, enabled)"
            />
          </div>
        </div>
        <div>
          Aeration Pump:
          <div class="inline-block">
            <font-awesome-icon v-if="deviceStatus.aeration.status === undefined" :icon="['fas', 'spinner']" spin class="text-gray-600 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.aeration.status === true" :icon="['fas', 'check-circle']" class="text-green-500 ml-3 w-4 h-4 inline" />
            <font-awesome-icon v-if="deviceStatus.aeration.status === false" :icon="['fas', 'times-circle']" class="text-red-500 ml-3 w-4 h-4 inline" />
            <ToggleSwitch
              class="inline"
              :enabled="deviceStatus.aeration.status === true"
              @toggle="(enabled) => toggleDeviceState(deviceStatus.aeration.id, enabled)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-7">
        <button
          v-for="template in scheduleTemplate"
          :key="template.id"
          :class="dayButtonClass(template.id)"
          @click="selectedDay = template.id"
        >
          {{ template.name }}
        </button>
      </div>
    </div>

    <div class="mt-3">
      <Schedule
        :key="selectedDay"
        :schedule="selectedSchedule"
        :gpio="gpio"
        :day="selectedDay"
        @saved="saveModifiedSchedule"
      />
    </div>
  </div>
</template>
<script>
import moment from "moment";
import Schedule from "../components/Schedule";
import ToggleSwitch from "../components/ToggleSwitch";

export default {
  name: 'IndexPage',
  components: { ToggleSwitch, Schedule },
  data () {
    return {
      deviceStatus: {
        egress: {
          status: undefined,
          id: 'PUMP_EGRESS',
        },
        stirPump: {
          status: undefined,
          id: 'PUMP_STIR',
        },
        mainValve: {
          status: undefined,
          id: 'VALVE_MAIN',
        },
        aeration: {
          status: undefined,
          id: 'PUMP_AIR',
        },
      },
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
      ],
    };
  },
  computed: {
    selectedSchedule () {
      const filtered = this.$store.getters['api/schedules'].filter(schedule => schedule.id === this.selectedDay);
      const schedule = filtered[0] || {
        start: undefined,
        end: undefined,
        enabled: true,
      };

      if (schedule.copy) {
        return { ...(this.$store.getters['api/schedules'].filter(copied => copied.id === schedule.copy)[0]) || {}, ...schedule };
      }

      return schedule;
    },
    gpio () {
      return this.$store.getters['api/config'].gpio;
    },
  },
  methods: {
    toggleDeviceState (deviceId, setting) {
      this.$axios.post('/api/control-device/' + deviceId, {
        setting: (setting) ? 'on' : 'off',
      })
        .then((res) => {
          this.getDeviceStatuses();
        })
        .catch(error => console.error(error));
    },

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
    },
    saveModifiedSchedule (schedule) {
      this.$store.dispatch('api/saveSchedules', schedule).then(() => {
        //
      });
    },
    getDeviceStatuses () {
      for (const i in this.deviceStatus) {
        const device = this.deviceStatus[i];
        this.$axios.get('/api/device-status/' + device.id).then((res) => {
          this.deviceStatus[i].status = res.data.status;
        }).catch((error) => {
          console.error(error);
        });
      }
    },
  },
  mounted () {
    this.getDeviceStatuses();
    this.selectedDay = moment().format('dddd').toLowerCase();
    this.currentTimeInterval = setInterval(() => {
      this.currentTime = moment().format('dddd MMM Do - hh:mm:ss A z');
    }, 1000);
  },
  beforeDestroy () {
    clearInterval(this.currentTimeInterval);
  },
};
</script>
