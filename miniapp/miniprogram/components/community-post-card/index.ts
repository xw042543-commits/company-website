import type { CommunityPostSummary } from '../../services/community';
import { formatCommunityTime } from '../../utils/community-ui';

Component({
  properties: {
    post: {
      type: Object,
      value: {},
      observer() {
        const post = this.data.post as CommunityPostSummary | null;
        this.setData({ imageFailed: false, displayTime: post ? formatCommunityTime(post.publishedAt) : '' });
      },
    },
    reacting: { type: Boolean, value: false },
  },
  data: { imageFailed: false, displayTime: '' },
  methods: {
    imageError() { this.setData({ imageFailed: true }); },
    open() { this.triggerEvent('open', { id: (this.data.post as CommunityPostSummary | null)?.id }); },
    react() { if (!this.data.reacting) this.triggerEvent('react', { post: this.data.post }); },
    report() { this.triggerEvent('report', { id: (this.data.post as CommunityPostSummary | null)?.id }); },
  },
});
