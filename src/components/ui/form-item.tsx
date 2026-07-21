"use client";

import { ReactNode } from "react";
import { Label } from "./label";
import { FormItemDisplay, FormItemInnerDispaly, FieldType } from '@/types'
import { joinClasses } from '@/lib/utils'

export interface FormItemProps {
    label?: string; 
    children: ReactNode;
    display?: FormItemDisplay; // label 和 控件的布局
    innerDisplay?: FormItemInnerDispaly, // 内容的布局
    handler?: ReactNode;
    mergeCells?: boolean; // grid布局时的列数
    type:FieldType
}

export function FormItem({
    label,
    children,
    display = "row",
    innerDisplay = "flex",
    handler,
    mergeCells,
    type
}: FormItemProps) {
    // 处理 label 和 handler 的布局
    const renderLabelWithHandler = () => (
        <div className="flex items-center gap-1">
            <Label>{label}</Label>
            {handler}
        </div>
    );

    const outerClass = {
        'row': "flex justify-between" ,
        'col': "flex flex-col gap-1",
        'inline': "flex items-center gap-1"
    }

    const contentClass = {
        "flex": `flex flex-wrap gap-1.5 flex-1`,
        "grid-2": `grid grid-cols-2 gap-2`,
        "grid-3": `grid grid-cols-3 gap-2`,
        "grid-4": `grid grid-cols-4 gap-2`,
        "grid-5": `grid grid-cols-5 gap-2`,
    }


    // 处理表单控件的布局
    const renderChildren = () =>
        <div className={joinClasses([innerDisplay && contentClass[innerDisplay], label && display === 'row' && "flex-1", !label && "flex-1"])}>
            {children}
        </div>



    return (
        <div className={joinClasses([outerClass[display], mergeCells && 'col-span-full', ['text', 'toggle'].includes(type) ? ' items-center': ' items-start'])}>
            {label && (handler ? renderLabelWithHandler() : <Label style={{width: display==='row'? '70px':''}}>{label}</Label>)}
            {renderChildren()}
        </div>
    );
}
