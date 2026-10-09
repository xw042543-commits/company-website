package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

/** Scalar projections deliberately never join accounts, contact or provider identity tables. */
@Repository
class CommunityModerationQueryRepository {
    private final NamedParameterJdbcTemplate jdbc;
    CommunityModerationQueryRepository(NamedParameterJdbcTemplate jdbc){this.jdbc=jdbc;}
    private static final String TARGETS="""
            (SELECT 'POST' AS type,id,status,body,version,created_at,NULL::bigint AS post_id,NULL::bigint AS parent_id FROM community_posts
             UNION ALL
             SELECT 'COMMENT',id,status,body,version,created_at,post_id,parent_comment_id FROM community_comments) t
            """;
    List<CommunityModerationPage.Item> queue(String status,CommunityTargetType type,String reason,OffsetDateTime from,OffsetDateTime to,
            CommunityCursorCodec.Position after,String afterType,int size) {
        String predicate=switch(status){
            case "PENDING" -> "(t.status='PENDING_REVIEW' OR EXISTS (SELECT 1 FROM community_reports r WHERE r.target_type=t.type AND r.target_id=t.id AND r.status='OPEN'))";
            case "HIDDEN" -> "t.status='HIDDEN'";
            case "PROCESSED" -> "EXISTS (SELECT 1 FROM community_moderation_actions a WHERE a.target_type=t.type AND a.target_id=t.id)";
            default -> throw new IllegalArgumentException("Invalid moderation queue status");
        };
        var parameters=new HashMap<String,Object>();parameters.put("limit",size);
        StringBuilder where=new StringBuilder(predicate);
        if(type!=null){where.append(" AND t.type=:type");parameters.put("type",type.name());}
        if(reason!=null){where.append(" AND EXISTS (SELECT 1 FROM community_reports r WHERE r.target_type=t.type AND r.target_id=t.id AND r.reason_code=:reason)");parameters.put("reason",reason);}
        if(from!=null){where.append(" AND t.created_at>=:from");parameters.put("from",from);}
        if(to!=null){where.append(" AND t.created_at<=:to");parameters.put("to",to);}
        if(after!=null){where.append(" AND (t.created_at<:time OR (t.created_at=:time AND (t.id<:id OR (t.id=:id AND t.type<:afterType))))");
            parameters.put("time",after.timestamp());parameters.put("id",after.id());parameters.put("afterType",afterType);}
        return jdbc.query("SELECT t.type,t.id,t.status,substring(t.body from 1 for 160) AS preview,t.version,t.created_at,"+
                "(SELECT count(*) FROM community_reports r WHERE r.target_type=t.type AND r.target_id=t.id AND r.status='OPEN') AS report_count FROM "+TARGETS+
                " WHERE "+where+" ORDER BY t.created_at DESC,t.id DESC,t.type DESC LIMIT :limit",parameters,(rs,n)->new CommunityModerationPage.Item(
                CommunityTargetType.valueOf(rs.getString("type")),rs.getString("id"),CommunityContentStatus.valueOf(rs.getString("status")),
                rs.getString("preview"),rs.getLong("version"),rs.getLong("report_count"),rs.getObject("created_at",OffsetDateTime.class)));
    }
    CommunityModerationDetail detail(CommunityTargetType type,long id,List<CommunityModerationDetail.Action> actions,String next) {
        var parameters=Map.<String,Object>of("type",type.name(),"id",id);
        var summaries=jdbc.query("SELECT reason_code,status,count(*) AS total FROM community_reports WHERE target_type=:type AND target_id=:id GROUP BY reason_code,status ORDER BY reason_code,status",
                parameters,(rs,n)->new CommunityModerationDetail.ReportSummary(rs.getString("reason_code"),CommunityReportStatus.valueOf(rs.getString("status")),rs.getLong("total")));
        var results=jdbc.query("SELECT * FROM "+TARGETS+" WHERE t.type=:type AND t.id=:id",parameters,(rs,n)->new CommunityModerationDetail(type,Long.toString(id),
                CommunityContentStatus.valueOf(rs.getString("status")),rs.getString("body"),rs.getString("post_id"),rs.getString("parent_id"),rs.getLong("version"),
                summaries.stream().filter(s->s.status()==CommunityReportStatus.OPEN).mapToLong(CommunityModerationDetail.ReportSummary::count).sum(),summaries,actions,next));
        return results.stream().findFirst().orElseThrow(()->CommunityModerationTargets.missing(type));
    }
    List<CommunityModerationDetail.Action> actions(CommunityTargetType type,long id,CommunityCursorCodec.Position after) {
        var parameters=new HashMap<String,Object>();parameters.put("type",type.name());parameters.put("id",id);
        String condition="";
        if(after!=null){condition=" AND (created_at<:time OR (created_at=:time AND id<:actionId))";parameters.put("time",after.timestamp());parameters.put("actionId",after.id());}
        return jdbc.query("SELECT id,action,reason_code,previous_status,next_status,created_at FROM community_moderation_actions WHERE target_type=:type AND target_id=:id"+condition+
                " ORDER BY created_at DESC,id DESC LIMIT 21",parameters,(rs,n)->new CommunityModerationDetail.Action(rs.getString("id"),rs.getString("action"),rs.getString("reason_code"),
                rs.getString("previous_status")==null?null:CommunityContentStatus.valueOf(rs.getString("previous_status")),
                rs.getString("next_status")==null?null:CommunityContentStatus.valueOf(rs.getString("next_status")),rs.getObject("created_at",OffsetDateTime.class)));
    }
}
