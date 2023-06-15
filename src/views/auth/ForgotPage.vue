<script setup lang="ts">

const email = ref('')
</script>
<template>
  <div>
    <p>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <v-text-field
            v-model="email"
            label="Email"
            name="email"
            prepend-icon="mdi-email"
            type="email"
            outlined
            required
          ></v-text-field>
        </v-col>
      </v-row>
    </p>
  </div>
</template>
