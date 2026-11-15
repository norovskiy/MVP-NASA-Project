import fs from 'node:fs';
import parser from '@babel/parser';
import traversePackage from '@babel/traverse';
import generatorPackage from '@babel/generator';
import * as types from '@babel/types';
const traverse=traversePackage.default,generate=generatorPackage.default;
for(const filename of ['src/main.jsx','src/components/ScrollJourney.jsx','src/components/SpaceScene.jsx']){
 const ast=parser.parse(fs.readFileSync(filename,'utf8'),{sourceType:'module',plugins:['jsx']});
 if(filename.endsWith('SpaceScene.jsx'))ast.program.body.unshift(types.importDeclaration([types.importSpecifier(types.identifier('t'),types.identifier('t'))],types.stringLiteral('../i18n')));
 traverse(ast,{
  JSXText(path){const raw=path.node.value;if(!raw.trim()||!/[A-Za-z]{2}/.test(raw))return;const text=raw.replace(/\s+/g,' ');path.replaceWith(types.jsxExpressionContainer(types.callExpression(types.identifier('t'),[types.stringLiteral(text)])))},
  JSXExpressionContainer:{exit(path){if(path.parent.type==='JSXAttribute')return;const e=path.node.expression;if(e.type==='JSXEmptyExpression'||e.type==='JSXElement'||e.type==='JSXFragment')return;if(e.type==='CallExpression'&&e.callee.type==='Identifier'&&e.callee.name==='t')return;const stringish=['MemberExpression','OptionalMemberExpression','StringLiteral','TemplateLiteral','ConditionalExpression','LogicalExpression','BinaryExpression'].includes(e.type)||(e.type==='CallExpression'&&e.callee.type==='MemberExpression'&&['toUpperCase','toLowerCase'].includes(e.callee.property.name));if(!stringish)return;let containsJsx=false;types.traverseFast(e,n=>{if(n.type==='JSXElement'||n.type==='JSXFragment')containsJsx=true});if(!containsJsx)path.node.expression=types.callExpression(types.identifier('t'),[e])}},
  JSXAttribute(path){if(!['aria-label','placeholder','title','alt','label'].includes(path.node.name?.name))return;const val=path.node.value;if(!val)return;if(val.type==='StringLiteral')path.node.value=types.jsxExpressionContainer(types.callExpression(types.identifier('t'),[val]));else if(val.type==='JSXExpressionContainer'&&!(val.expression.type==='CallExpression'&&val.expression.callee.name==='t'))val.expression=types.callExpression(types.identifier('t'),[val.expression])}
 });fs.writeFileSync(filename,generate(ast,{jsescOption:{minimal:true}},'').code+'\n');
}
