<template>
  <div>
    <button
      ref="toggleButton"
      type="button"
      :class="toggleStyle"
      @click="toggle()"
    >
      <span class="sr-only">{{ altText }}</span>
      <span
        v-if="!enabled"
        aria-hidden="true"
        class="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
      />
      <span
        v-else
        aria-hidden="true"
        class="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
      />
    </button>
  </div>
</template>
<script>
export default {
  name: 'ToggleSwitch',
  props: {
    enabled: {
      type: Boolean,
      default: false,
    },
    altText: {
      type: String,
      default: 'Toggle',
    },
  },
  computed: {
    toggleStyle () {
      const style = [
        'relative',
        'inline-flex',
        'flex-shrink-0',
        'h-6',
        'w-11',
        'border-2',
        'border-transparent',
        'rounded-full',
        'cursor-pointer',
        'transition-colors',
        'ease-in-out',
        'duration-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'focus:ring-indigo-500',
        'dark:focus:ring-gray-500',
        'ml-2',
      ];

      if (this.enabled) {
        style.push('bg-indigo-600', 'dark:bg-gray-800');
      } else {
        style.push('bg-gray-200', 'dark:bg-gray-500');
      }

      return style.join(' ');
    },
  },
  methods: {
    toggle () {
      this.$refs.toggleButton.blur();
      this.$emit('toggle', !this.enabled);
    },
  },
};
</script>
