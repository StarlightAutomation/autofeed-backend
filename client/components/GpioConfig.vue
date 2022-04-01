<template>
  <div class="w-full border border-dashed border-blue-500 p-3 rounded">
    <div class="border-b border-gray-300 pb-1 mb-3">
      <div class="float-right">
        <button
          :class="saveButtonClass"
          :disabled="!saveButtonEnabled"
          @click="saveConfig"
        >
          Save
        </button>
      </div>
      <h1 class="text-lg">
        {{ config.name }}
      </h1>
      <div class="clear-both" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
      <div class="text-sm">
        <label>Device ID</label>
        <input
          class="text-input mt-1 font-mono bg-gray-100"
          type="text"
          :value="config.id"
          disabled
        >
      </div>
      <div class="text-sm">
        <label>Device Name</label>
        <input
          class="text-input mt-1 font-mono"
          type="text"
          :value="editedConfig.name || config.name"
          @change="changeName"
        >
      </div>
      <div class="text-sm">
        <label>GPIO Pin</label>
        <input
          class="text-input mt-1 font-mono"
          type="number"
          :value="editedConfig.pin || config.pin"
          @change="changePin"
        >
      </div>
      <div class="text-sm">
        <label>Normal Condition</label>
        <div class="mt-2.5">
          <ToggleSwitch
            class="inline"
            :enabled="(editedConfig.normal || config.normal) === 'on'"
            @toggle="(enabled) => changeNormalCondition(enabled)"
          />
          <div class="inline ml-3 font-mono">
            {{ (editedConfig.normal || config.normal).toUpperCase() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ToggleSwitch from "./ToggleSwitch";
export default {
  name: 'GpioConfig',
  components: { ToggleSwitch },
  props: {
    config: {
      required: true,
      type: Object,
    },
  },
  data () {
    return {
      editedConfig: {
        name: undefined,
        pin: undefined,
        normal: undefined,
      },
    };
  },
  computed: {
    saveButtonEnabled () {
      return this.editedConfig.name !== undefined || this.editedConfig.pin !== undefined || this.editedConfig.normal !== undefined;
    },
    saveButtonClass () {
      const style = [
        'px-3',
        'py-1',
        'border',
        'rounded',
      ];

      if (this.saveButtonEnabled) {
        style.push(...[
          'cursor-pointer',
          'bg-blue-500',
          'border-blue-600',
          'hover:bg-blue-600',
          'text-white',
        ]);
      } else {
        style.push(...[
          'cursor-default',
          'bg-blue-400',
          'border-blue-500',
          'text-gray-100',
        ]);
      }

      return style.join(' ');
    },
  },
  methods: {
    changeName (event) {
      this.editedConfig.name = event.target.value;
    },
    changePin (event) {
      this.editedConfig.pin = Number(event.target.value);
    },
    changeNormalCondition (enabled) {
      this.editedConfig.normal = (enabled) ? 'on' : 'off';
    },

    saveConfig () {
      this.$emit('saved', this.config.id, {
        name: this.editedConfig.name || this.config.name,
        pin: this.editedConfig.pin || this.config.pin,
        normal: this.editedConfig.normal || this.config.normal,
      });

      this.editedConfig = {
        name: undefined,
        pin: undefined,
        normal: undefined,
      };
    },
  },
};
</script>
