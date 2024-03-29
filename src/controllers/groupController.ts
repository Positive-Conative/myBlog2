import { Request, Response, NextFunction } from 'express';
import { categoryRepo } from '../models/repository/categoryRepo';
import { groupRepo } from '../models/repository/groupRepo';
import chkData from '../lib/checkData';

import {
    addGroupDto,
    groupKeyDto,
    setgroupFlagDto,
    modifyGroupDto,
    groupVarOpt
} from '../interfaces/groupDto';

const cRepo = new categoryRepo();
const gRepo = new groupRepo(); 
 
const groupController = {
    // 그룹 추가
    async addGroup(req: Request, res: Response, next: NextFunction) {
        const bodyData: addGroupDto = {
            category: { "c_idx": parseInt(req.body.categoryIdx, 10) || -1 },
            g_name: req.body.groupName,
            g_memo: req.body.groupMemo,
            g_flag: 0
        };

        // 파라미터 Check
        if (chkData(bodyData, groupVarOpt) === false) {
            return next('API002');
        }

        // 카테고리 존재 여부 확인
        if (! await cRepo.getCategoryOne({c_idx: bodyData.category.c_idx})) {
            return next('API203');
        }

        // 그룹 중복 여부 확인
        if (await gRepo.getGroupOne({g_name:bodyData.g_name})) {
            return next('API101');
        }

        await gRepo.addGroup(bodyData);
        return res.json({ "message": "처리 완료!" });
    },

    async getGroupInfo(req: Request, res: Response, next: NextFunction) {
        const bodyData: groupKeyDto = {
            g_idx: parseInt(req.params.groupIdx, 10) || -1,
        };

        // 잘못된 파라미터?
        if (chkData(bodyData, groupVarOpt) === false) {
            return next('API002');
        }

        // 그룹 찾을 수 있는지 확인
        const result = await gRepo.getGroupOne({g_idx:bodyData.g_idx});
        if (result === undefined) {
            return next('API201');
        }

        // 비공개 그룹인지 확인하고, 정상이라면 flag 지움 처리
        if (result.flag === 1) {
            return next('API301');
        } else {
            delete result.flag;
        }

        return res.json({ result, "message": "정상적으로 조회되었습니다." });
    },

    async setGroupFlag(req: Request, res: Response, next: NextFunction) {
        const bodyData: setgroupFlagDto = {
            g_idx: parseInt(req.params.groupIdx, 10) || -1,
            g_flag: req.body.state || -1,
        };

        // 잘못된 파라미터?
        if (chkData(bodyData, groupVarOpt) === false) {
            return next('API002');
        }

        // 그룹 찾을 수 있는지 확인
        if (await gRepo.getGroupOne({g_idx: bodyData.g_idx}) === undefined) {
            return next('API201');
        }

        await gRepo.setGroupFlag(bodyData);
        return res.json({ "message": "정상적으로 처리되었습니다." });
    },

    async modifyGroup(req: Request, res: Response, next: NextFunction) {
        const bodyData: modifyGroupDto = {
            category:   { "c_idx": parseInt(req.body.categoryIdx, 10) || -1 },
            g_idx:      parseInt(req.params.groupIdx, 10) || -1,
            g_name:     req.body.groupName || '',
            g_memo:     req.body.groupMemo || '',
        };

        // 잘못된 파라미터?
        if (chkData(bodyData, groupVarOpt) === false) {
            return next('API002');
        }

        // 그룹 찾을 수 있는지 확인
        const result = await gRepo.getGroupOne({g_idx: bodyData.g_idx});
        if (!result) {
            return next('API201');
        }

        // 추가 시 중복 여부 확인
        if(result.name !== bodyData.g_name) {
            if (await gRepo.getGroupOne({g_name: bodyData.g_name})) {
                return next('API201');
            }
        }

        // 카테고리 존재 여부 확인
        if(bodyData.category.c_idx !== -1) {
            if(! await cRepo.getCategoryOne({c_idx: bodyData.category.c_idx})) {
                return next('API203');
            }
        }

        await gRepo.setGroupInfo(bodyData);
        return res.json({"message": "정상적으로 처리되었습니다."});
    }
}

export = groupController;