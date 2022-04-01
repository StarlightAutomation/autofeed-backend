<template>
  <div class="w-full md:w-2/3 ml-auto mr-auto md:px-0 px-3">
    <h1 class="text-2xl mt-5 border-b pb-2 mb-3">Home Assistant Configuration</h1>
    <div class="text-lg inline">
      Enabled:
      <ToggleSwitch
        class="inline ml-3"
        :enabled="enabled"
        @toggle="toggleEnabled"
      />
    </div>
    <div class="mt-3 border border-dashed border-blue-500 rounded p-3" v-if="enabled">
      <div class="mb-3">
        <div class="mb-1">
          MQTT URL:
          <span class="rounded bg-red-500 border border-red-700 text-red-900 text-xs uppercase px-0.5">required</span>
        </div>
        <input type="text" class="text-input font-mono" v-model="editedConfig.host" placeholder="mqtt://192.168.1.1:1883" />
      </div>
      <div class="mb-3">
        <div class="mb-1">
          Node Prefix:
          <span class="rounded bg-red-500 border border-red-700 text-red-900 text-xs uppercase px-0.5">required</span>
        </div>
        <input type="text" class="text-input font-mono" v-model="editedConfig.nodePrefix" placeholder="autofeed_1" />
        <div class="rounded border border-blue-500 bg-blue-300 shadow p-2 text-blue-800 mt-1">
          <font-awesome-icon :icon="['fas', 'info']" class="mr-3 w-4 h-4 inline" />
          This should be a unique identifier for this AutoFeed device. For example,
          <span class="font-mono text-gray-800">autofeed_1</span>, which will produce entities with IDs
          such as <span class="font-mono text-gray-800">switch.autofeed_1_egress_pump</span>.
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-3">
          <div class="mb-1">Username:</div>
          <input type="text" class="text-input font-mono" v-model="editedConfig.username" placeholder="HomeAssistantUser" />
        </div>
        <div class="mb-3">
          <div class="mb-1">Password:</div>
          <input type="password" class="text-input font-mono" v-model="editedConfig.password" placeholder="HomeAssistantPassword" />
        </div>
      </div>

      <div class="mt-3">
        <button
          :disabled="buttonDisabled"
          :class="buttonClass"
          @click="saveConfig()"
        >
          Save Configuration
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import ToggleSwitch from "../components/ToggleSwitch";
export default {
  name: 'MqttConfigPage',
  components: {ToggleSwitch},
  data () {
    return {
      enabled: false,

      editedConfig: {},
    };
  },
  computed: {
    mqttConfig () {
      return this.$store.getters['api/config'].mqtt;
    },
    buttonClass () {
      const style = [
        'rounded',
        'w-full',
        'border',
        'p-2'
      ];

      if (this.buttonDisabled) {
        style.push(...[
          'cursor-default',
          'text-gray-200',
          'bg-blue-400',
          'border-blue-500',
        ]);
      } else {
        style.push(...[
          'cursor-pointer',
          'bg-blue-500',
          'border-blue-600',
          'hover:bg-blue-400',
          'text-gray-100',
        ]);
      }

      return style.join(' ');
    },
    buttonDisabled () {
      return !!!this.editedConfig.host || !!!this.editedConfig.nodePrefix === undefined;
    },
  },
  methods: {
    toggleEnabled (enabled) {
      this.enabled = enabled;
      if (!this.enabled) {
        // User just disabled the integration, so update that on the API
        this.$axios.put('/api/mqtt-config', {}).then(() => this.$store.dispatch('api/getConfig'));
      }
    },
    saveConfig () {
      this.$axios.put('/api/mqtt-config', this.editedConfig).then(() => this.$store.dispatch('api/getConfig'));
    },
  },
  mounted () {
    this.enabled = this.mqttConfig !== undefined;
    if (this.mqttConfig !== undefined) {
      this.editedConfig = { ...this.mqttConfig };
    }
  }
};
</script>
