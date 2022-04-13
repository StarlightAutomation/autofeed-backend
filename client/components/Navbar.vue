<template>
  <nav class="bg-white dark:bg-cool-gray-800 shadow">
    <div class="w-full md:w-2/3 ml-auto mr-auto md:px-0 px-3">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            DIYAutoFeed
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <nuxt-link
              v-for="item in nav"
              :key="item.id"
              :to="item.href"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              {{ item.text }}
            </nuxt-link>
          </div>
        </div>

        <div class="flex">
          <div class="inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <font-awesome-icon
              :icon="lightingIcon"
              :class="lightingIconStyle"
              @click="toggleLightingMode()"
            />
          </div>
          <div class="-mr-2 flex items-center sm:hidden">
            <button
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              @click="menuOpen = !menuOpen"
            >
              <font-awesome-icon :icon="['fas', 'bars']" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="menuOpen" id="mobile-menu" class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <nuxt-link
          v-for="item in nav"
          :key="item.id"
          :to="item.href"
          class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
        >
          {{ item.text }}
        </nuxt-link>
      </div>
    </div>
  </nav>
</template>
<script>
export default {
  name: 'Navbar',
  props: ['lightingMode'],
  data () {
    return {
      nav: [
        {
          id: 'dashboard',
          text: 'Dashboard',
          icon: '',
          href: '/',
        },
        {
          id: 'gpio-config',
          text: 'GPIO Configuration',
          icon: '',
          href: '/gpio-config',
        },
        {
          id: 'mqtt-config',
          text: 'Home Assistant Configuration',
          icon: '',
          href: '/mqtt-config',
        },
      ],
      menuOpen: false,
    };
  },
  computed: {
    lightingIcon () {
      let icon = ['fas'];
      if (this.lightingMode === 'dark') {
        icon.push('sun');
      } else {
        icon.push('moon');
      }
      return icon;
    },
    lightingIconStyle () {
      let style = [
        'cursor-pointer',
        'hover:text-gray-400',
        'dark:hover:text-gray-500',
        'text-gray-400',
        'hover:text-gray-300',
        'md:mr-0',
        'mr-3',
        'w-4',
        'h-4',
      ];
      return style.join(' ');
    },
  },
  methods: {
    toggleSidebar () {
      this.$refs.sidebarToggle.blur();
      this.$emit('toggleSidebar');
    },
    toggleLightingMode () {
      let newMode = this.lightingMode === 'dark' ? 'light' : 'dark';
      this.$emit('lightingMode', newMode);
    },
  },
};
</script>
