<template>
  <div class="mt-1 relative">
    <button
      type="button"
      class="dropdown-button"
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-labelledby="listbox-label"
      @click="toggleList()"
    >
      <span class="truncate">
        {{ selected.name || '&nbsp;' }}
      </span>
      <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <font-awesome-icon :icon="['fas', 'sort']" class="text-gray-300 dark:text-gray-400 w-4 h-4 inline" />
      </span>
    </button>

    <ul
      v-if="listOpen"
      class="dropdown-container"
      tabindex="-1"
      role="listbox"
      aria-labelledby="listbox-label"
    >
      <li
        v-for="option in options"
        id="listbox-option-0"
        :key="option.id"
        role="option"
        @click="selectOption(option.id)"
      >
        <span class="font-normal truncate">
          {{ option.name }}
        </span>
        <span v-if="option.id === selectedOption" class="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4 dark:text-gray-300">
          <font-awesome-icon :icon="['fas', 'check']" class="w-4 h-4 inline" />
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'Dropdown',
  props: ['options', 'selectedOption'],
  components: {
  },
  data () {
    return {
      listOpen: false,
    };
  },
  computed: {
    selected () {
      return this.options[this.selectedOption] || {};
    },
  },
  methods: {
    toggleList () {
      this.listOpen = !this.listOpen;
    },
    selectOption (optionId) {
      this.listOpen = false;
      this.$emit('optionSelected', this.options[optionId]);
    },
  },
};
</script>
