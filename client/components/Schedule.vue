<template>
  <div class="w-full">
    <div class="border border-dashed border-blue-500 p-3">
      <h1 class="text-lg border-b border-blue-300 pb-1 mb-2">
        {{ formattedDay }}
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="mt-3">
            <div v-if="schedule.copy" class="mb-3">
              <b>Copy Of:</b>
              {{ schedule.copy }}
            </div>
            <div class="mb-3">
              <b>Enabled:</b>
              <font-awesome-icon v-if="schedule.enabled" :icon="['fas', 'check-circle']" class="text-green-500 ml-3 w-4 h-4 inline" />
              <font-awesome-icon v-if="!schedule.enabled" :icon="['fas', 'times-circle']" class="text-red-500 ml-3 w-4 h-4 inline" />
            </div>
            <div>
              <span class="font-medium">Start Time:</span>
              {{ schedule.start }}
            </div>
            <div>
              <span class="font-medium">End Time:</span>
              {{ schedule.end }}
            </div>
            <div class="mt-3">
              <div class="font-medium">
                States:
              </div>
              <ul class="list-disc px-8">
                <li v-for="state in schedule.states" :key="state.id">
                  {{ getGpioName(state.id) }} - {{ state.state.toUpperCase() }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <h1 class="text-lg mb-3">
            Modify Schedule
          </h1>
          <label class="font-medium">Enabled:</label>
          <ToggleSwitch
            :enabled="modifiedSchedule.enabled"
            @toggle="(enabled) => modifiedSchedule.enabled = enabled"
          />

          <div class="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label for="start">Start Time</label>
              <input
                id="start"
                v-model="modifiedSchedule.start"
                class="text-input"
                step="1"
                type="time"
              >
            </div>
            <div>
              <label for="end">End Time</label>
              <input
                id="end"
                v-model="modifiedSchedule.end"
                class="text-input"
                step="1"
                type="time"
              >
            </div>
          </div>

          <div class="mt-3">
            <h1 class="text-base font-medium mb-3">
              States
            </h1>
            <div class="grid grid-cols-1 gap-2">
              <div v-for="device in gpio" :key="device.id">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div class="font-medium">
                    <div class="mt-2">
                      {{ device.name }}
                    </div>
                  </div>
                  <div>
                    <label>Include</label>
                    <ToggleSwitch
                      :enabled="isDeviceIncluded(device.id)"
                      @toggle="(enabled) => toggleDeviceInclusion(device.id, enabled)"
                    />
                  </div>
                  <div>
                    <label>State</label>
                    <ToggleSwitch
                      :enabled="isDeviceEnabled(device.id)"
                      @toggle="(enabled) => toggleDeviceState(device.id, enabled)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-b border-blue-300 mt-3 mb-3" />
          <div class="w-full">
            <button
              class="w-full rounded bg-blue-600 border border-blue-700 px-3 py-1.5 text-gray-100 hover:bg-blue-500"
              @click="save()"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ToggleSwitch from "./ToggleSwitch";
export default {
  name: 'Schedule',
  components: { ToggleSwitch },
  props: {
    schedule: {
      type: Object,
      required: true,
    },
    gpio: {
      type: Array,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      modifiedSchedule: {
        enabled: true,
        states: [],
      },
    };
  },
  computed: {
    formattedDay () {
      return this.day.charAt(0).toUpperCase() + this.day.slice(1);
    },
  },
  methods: {
    getGpioName (id) {
      const config = this.$store.getters["api/config"];
      const filtered = config.gpio.filter(gpio => gpio.id === id);
      const gpio = filtered[0] || {};

      return gpio.name || id;
    },
    isDeviceIncluded (id) {
      const mapped = this.modifiedSchedule.states?.map(state => state.id) || [];
      return mapped.includes(id);
    },
    isDeviceEnabled (id) {
      const filtered = this.modifiedSchedule.states?.filter(state => state.id === id);
      if (filtered.length === 0) { return false; }

      return filtered[0].state === 'on';
    },
    toggleDeviceInclusion (id, enabled) {
      if (enabled) {
        this.modifiedSchedule.states.push({
          id,
          state: 'off',
        });
      } else {
        for (const i in this.modifiedSchedule.states) {
          const state = this.modifiedSchedule.states[i];
          if (state.id === id) {
            this.modifiedSchedule.states.splice(i, 1);
          }
        }
      }
    },
    toggleDeviceState (id, state) {
      const stateName = (state) ? 'on' : 'off';
      for (const i in this.modifiedSchedule.states) {
        const existingState = this.modifiedSchedule.states[i];
        if (existingState.id === id) {
          this.modifiedSchedule.states[i].state = stateName;
        }
      }
    },
    setModifiedScheduleOnMount () {
      if (this.schedule.id) {
        this.modifiedSchedule = { ...this.schedule, states: [...this.schedule.states] };
        return;
      }

      this.modifiedSchedule = {
        enabled: true,
        states: [],
      };
    },
    save () {
      this.$emit('saved', this.modifiedSchedule);
    },
  },
  mounted () {
    this.setModifiedScheduleOnMount();
  },
};
</script>
