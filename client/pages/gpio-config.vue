<template>
  <div class="w-full md:w-2/3 ml-auto mr-auto md:px-0 px-3">
    <h1 class="text-2xl mt-5 border-b pb-2 mb-3">GPIO Configuration</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="config in gpioConfig" :key="config.id">
        <GpioConfig
          :config="config"
          @saved="updateGpioConfig"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ToggleSwitch from "../components/ToggleSwitch";
import GpioConfig from "../components/GpioConfig";
export default {
  name: 'GpioConfigPage',
  components: {GpioConfig, ToggleSwitch},
  data () {
    return {
      editedConfigs: {},
    };
  },
  computed: {
    gpioConfig () {
      return this.$store.getters['api/config'].gpio;
    },
  },
  methods: {
    updateGpioConfig (gpioId, config) {
      this.$store.dispatch('api/saveConfig', { id: gpioId, ...config });
    },
  },
};
</script>
