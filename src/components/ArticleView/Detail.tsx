import React, { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import styles from "@/components/ArticleView/view.module.scss";
import Dayjs from "dayjs";
import { getChannelFavicon } from "@/helpers/parseXML";
import { useBearStore } from "@/stores";
import * as dataAgent from "@/helpers/dataAgent";
import { motion, AnimatePresence } from "framer-motion";
import { fetch } from "@tauri-apps/api/http";

function createMarkup(html: string) {
  return { __html: html };
}

export interface ArticleDetailProps {
  article: any;
}

export const ArticleDetail = (props: ArticleDetailProps) => {
  const { article } = props;
  const store = useBearStore((state) => ({
    feed: state.feed,
  }));
  const { pub_date, channel_link } = article;
  const ico = getChannelFavicon(channel_link);
  const [pageContent, setPageContent] = useState("");
  const [banner, setBanner] = useState("");

  useEffect(() => {
    setBanner("");
    setPageContent("");

    // try to get the best banner if there is no image in article content
    // it will make render slower
    // if (
    //   article && (article.content || article.description).search(/<img[^>]+>/gi) === -1
    // ) {
    //   dataAgent.getBestImage(article.link).then((image) => {
    //     setBanner(image);
    //   });
    // }

    article &&
      dataAgent.getArticleDetail(article.uuid).then((res) => {
        console.log("%c Line:102 🥓 res", "color:#33a5ff", res);
        const { data } = res;
        const content = (data.content || data.description || "").replace(
          /<a[^>]+>/gi,
          (a: string) => {
            if (!/\starget\s*=/gi.test(a)) {
              return a.replace(/^<a\s/, '<a target="_blank"');
            }

            return a;
          }
        );

        setPageContent(content);
      });
  }, [article]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={article.uuid}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="m-auto">
          <div className="pb-4 border-b border-border">
            <div className="mt-6 mb-5 text-4xl font-bold text-detail-headline">
              {article.title}
            </div>
            <div className={classnames(styles.meta)}>
              <span className={styles.channelInfo}>
                <img src={store.feed?.logo || ico} alt="" className="rounded" />
                {article.channel_title}
              </span>
              {article.author && (
                <span
                  className={classnames(styles.author, "text-detail-paragraph")}
                >
                  {article.author}
                </span>
              )}
              <span
                className={classnames(styles.time, "text-detail-paragraph")}
              >
                {Dayjs(new Date(pub_date || new Date())).format(
                  "YYYY-MM-DD HH:mm"
                )}
              </span>
            </div>
          </div>
          <div className="m-auto pt-1 mt-6">
            {banner && (
              <div className={styles.banner}>
                <img src={banner} alt="" />
              </div>
            )}
            <div
              className={classnames("reading-content", "text-detail-paragraph")}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={createMarkup(pageContent)}
            />
            {/*<div*/}
            {/*  className={classnames("reading-content", "text-detail-paragraph")}>*/}
            {/*    <iframe src={article.link} className="w-full" allowFullScreen></iframe>*/}
            {/*  </div>*/}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
