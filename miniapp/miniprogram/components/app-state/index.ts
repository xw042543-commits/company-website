Component({
  properties: {
    kind: { type: String, value: 'loading' },
    title: { type: String, value: '' },
    description: { type: String, value: '' },
    retryable: { type: Boolean, value: false },
  },
  methods: {
    retry() { this.triggerEvent('retry'); },
  },
});
